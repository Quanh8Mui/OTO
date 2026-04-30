export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'
const TOKEN_KEY = 'oto_auth_token'

export type AuthResponse = {
  token: string
  userId: number
  email: string
  fullName: string
  role: Role
}

export type UserMe = {
  id: number
  email: string
  fullName: string
  phone?: string
  role: Role
}

export type Vehicle = {
  id: number
  licensePlate: string
  brand?: string
  model?: string
  year?: number
}

export type Booking = {
  id: number
  bookingNumber: string
  vehicleId: number
  licensePlate: string
  serviceName?: string
  serviceTypeLabel?: string
  requestedDate: string
  timeSlot?: string
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export type RepairOrder = {
  id: number
  orderNumber: string
  licensePlate: string
  vehicleLabel?: string
  status: string
  progressNotes?: string
  assignedStaffName?: string
}

export type ProgressEvent = {
  id: number
  message: string
  stepLabel?: string
  createdByName?: string
  createdAt: string
}

export type QuoteLine = {
  id: number
  lineType: 'LABOR' | 'PART'
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Quote = {
  id: number
  quoteNumber: string
  repairOrderId: number
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  grandTotal: number
  rejectedReason?: string
  lines: QuoteLine[]
}

export type Payment = {
  id: number
  paymentNumber: string
  repairOrderId: number
  amount: number
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionRef?: string
  paidAt?: string
  createdAt?: string
}

export type DashboardResponse = {
  ordersByStatus: Record<string, number>
  revenueToday: number
  lowStockPartsCount: number
  pendingPartsRequests: number
}

export type Employee = {
  id: number
  email: string
  fullName: string
  phone?: string
  employeeCode: string
  position?: string
}

export type Part = {
  id: number
  sku: string
  name: string
  quantityOnHand: number
  minStock: number
  category?: string
}

export type ServiceItem = {
  id: number
  code: string
  name: string
  basePrice: number
  active: boolean
}

export type NotificationSetting = {
  id: number
  eventKey: string
  enabled: boolean
}

export type RevenueReport = {
  from: string
  to: string
  totalRevenue: number
  paymentCount: number
}

type RequestOptions = RequestInit & { auth?: boolean }

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options
  const finalHeaders = new Headers(headers)
  if (rest.body && !(rest.body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      message = body.error ?? body.message ?? message
    } catch {
      // noop
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload), auth: false }),
    register: (payload: { email: string; password: string; fullName: string; phone?: string }) =>
      request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload), auth: false }),
    me: () => request<UserMe>('/api/auth/me'),
  },
  customer: {
    vehicles: () => request<Vehicle[]>('/api/customer/vehicles'),
    bookings: () => request<Booking[]>('/api/customer/bookings'),
    createBooking: (payload: {
      vehicleId: number
      serviceTypeLabel: string
      requestedDate: string
      timeSlot?: string
      notes?: string
    }) => request<Booking>('/api/customer/bookings', { method: 'POST', body: JSON.stringify(payload) }),
    repairOrders: () => request<RepairOrder[]>('/api/customer/repair-orders'),
    repairProgress: (id: number) => request<ProgressEvent[]>(`/api/customer/repair-orders/${id}/progress`),
    quotes: () => request<Quote[]>('/api/customer/quotes'),
    approveQuote: (id: number, note?: string) =>
      request<Quote>(`/api/customer/quotes/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
    rejectQuote: (id: number, rejectedReason: string) =>
      request<Quote>(`/api/customer/quotes/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectedReason }),
      }),
    payments: () => request<Payment[]>('/api/customer/payments'),
    createPayment: (payload: { repairOrderId: number; quoteId?: number; amount: number; method: Payment['method'] }) =>
      request<Payment>('/api/customer/payments', { method: 'POST', body: JSON.stringify(payload) }),
    completePayment: (id: number, transactionRef: string) =>
      request<Payment>(`/api/customer/payments/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ transactionRef }),
      }),
    createRating: (payload: { repairOrderId: number; rating: number; comment?: string }) =>
      request('/api/customer/ratings', { method: 'POST', body: JSON.stringify(payload) }),
  },
  staff: {
    repairOrders: () => request<RepairOrder[]>('/api/staff/repair-orders?scope=mine'),
  },
  admin: {
    dashboard: () => request<DashboardResponse>('/api/admin/dashboard'),
    employees: () => request<Employee[]>('/api/admin/employees'),
    parts: () => request<Part[]>('/api/admin/parts'),
    services: () => request<ServiceItem[]>('/api/admin/service-catalog'),
    revenue: (from?: string, to?: string) => {
      const q = new URLSearchParams()
      if (from) q.set('from', from)
      if (to) q.set('to', to)
      return request<RevenueReport>(`/api/admin/revenue${q.size ? `?${q.toString()}` : ''}`)
    },
    notifications: () => request<NotificationSetting[]>('/api/admin/notification-settings'),
  },
}

