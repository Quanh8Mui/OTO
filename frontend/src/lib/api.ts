export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
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
  customerId: number
  customerName: string
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
  bookingId?: number | null
  customerId: number
  customerName: string
  vehicleId: number
  licensePlate: string
  vehicleLabel?: string
  assignedStaffId?: number | null
  assignedStaffName?: string
  status: string
  intakeNotes?: string
  progressNotes?: string
  createdAt?: string
  updatedAt?: string
}

export type RepairOrderResponse = RepairOrder

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
  taxRate?: number
  staffNotes?: string
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
  description?: string
  unitPrice?: number
  quantityOnHand: number
  minStock: number
  category?: string
  active?: boolean
}

export type StockStatus = 'OK' | 'LOW' | 'OUT'

export type ServiceItem = {
  id: number
  code: string
  name: string
  description?: string
  basePrice: number
  active?: boolean
}

export type PublicPartItem = {
  id: number
  sku: string
  name: string
  unitPrice: number
}

export type NotificationSetting = {
  id: number
  eventKey: string
  enabled: boolean
  channel?: string
  templateSubject?: string
  templateBody?: string
}

export type StaffSchedule = {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type RevenueReport = {
  from: string
  to: string
  totalRevenue: number
  paymentCount: number
}

export type ChangePasswordPayload = { currentPassword: string; newPassword: string }

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
  const init: RequestInit = { ...rest, headers: finalHeaders }
  const res = await fetch(`${API_BASE}${path}`, init)
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
    changePassword: (payload: ChangePasswordPayload) =>
      request<void>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
    me: () => request<UserMe>('/api/auth/me'),
  },
  catalog: {
    services: () => request<ServiceItem[]>('/api/public/catalog/services', { auth: false }),
    parts: () => request<PublicPartItem[]>('/api/public/catalog/parts', { auth: false }),
  },
  customer: {
    vehicles: () => request<Vehicle[]>('/api/customer/vehicles'),
    bookings: () => request<Booking[]>('/api/customer/bookings'),
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
    createVnpayPayment: (payload: { repairOrderId: number; quoteId?: number; amount: number; orderInfo?: string }) =>
      request<{ paymentUrl: string; paymentRef: string }>('/api/customer/vnpay/create', { method: 'POST', body: JSON.stringify(payload) }),
    createRating: (payload: { repairOrderId: number; rating: number; comment?: string }) =>
      request('/api/customer/ratings', { method: 'POST', body: JSON.stringify(payload) }),
    createBooking: (payload: {
      vehicleId?: number | null
      licensePlate: string
      brand?: string
      model?: string
      year?: number | null
      vin?: string
      color?: string
      serviceTypeLabel: string
      requestedDate: string
      timeSlot?: string
      notes?: string
    }) => request<Booking>('/api/customer/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  },
  staff: {
    bookings: () => request<Booking[]>('/api/staff/bookings'),
    schedules: () => request<StaffSchedule[]>('/api/staff/schedules'),
    createSchedule: (payload: { dayOfWeek: number; startTime: string; endTime: string }) =>
      request<StaffSchedule>('/api/staff/schedules', { method: 'POST', body: JSON.stringify(payload) }),
    deleteSchedule: (id: number) => request<void>(`/api/staff/schedules/${id}`, { method: 'DELETE' }),
    repairOrders: () => request<RepairOrder[]>('/api/staff/repair-orders?scope=mine'),
    repairOrdersAll: () => request<RepairOrder[]>('/api/staff/repair-orders?scope=all'),
    repairOrder: (id: number) => request<RepairOrderResponse>(`/api/staff/repair-orders/${id}`),
    repairProgress: (id: number) => request<ProgressEvent[]>(`/api/staff/repair-orders/${id}/progress`),
    updateRepairStatus: (id: number, payload: { status: string; progressNotes?: string }) =>
      request<RepairOrderResponse>(`/api/staff/repair-orders/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
    addRepairProgress: (id: number, payload: { message: string; stepLabel: string }) =>
      request<void>(`/api/staff/repair-orders/${id}/progress`, { method: 'POST', body: JSON.stringify(payload) }),
    completeWork: (id: number) => request<RepairOrderResponse>(`/api/staff/repair-orders/${id}/complete-work`, { method: 'POST' }),
    handover: (id: number) => request<RepairOrderResponse>(`/api/staff/repair-orders/${id}/handover`, { method: 'POST' }),
    partsRequests: (repairOrderId: number) =>
      request<Array<{ id: number; requestNumber: string; repairOrderId: number; status: string; adminNote?: string; createdAt?: string; fulfilledAt?: string; lines: Array<{ id: number; partId: number; partName: string; partSku: string; quantityRequested: number; quantityIssued: number }> }>>(
        `/api/staff/repair-orders/${repairOrderId}/parts-requests`,
      ),
    createPartsRequest: (payload: { repairOrderId: number; lines: Array<{ partId: number; quantityRequested: number }> }) =>
      request(`/api/staff/parts-requests`, { method: 'POST', body: JSON.stringify(payload) }),
    quotesForRepairOrder: (repairOrderId: number) => request<Quote[]>(`/api/staff/repair-orders/${repairOrderId}/quotes`),
    createQuoteDraft: (repairOrderId: number) =>
      request<Quote>(`/api/staff/repair-orders/${repairOrderId}/quotes`, { method: 'POST' }),
    saveQuoteLines: (quoteId: number, payload: { taxRate: number; staffNotes?: string; lines: Array<{ lineType: 'LABOR' | 'PART'; serviceCatalogId?: number | null; partId?: number | null; description: string; quantity: number; unitPrice: number }> }) =>
      request<Quote>(`/api/staff/quotes/${quoteId}/lines`, { method: 'PUT', body: JSON.stringify(payload) }),
    sendQuote: (quoteId: number) => request<Quote>(`/api/staff/quotes/${quoteId}/send`, { method: 'POST' }),
    createRepairIntake: (payload: {
      customerId: number
      vehicleId: number
      bookingId?: number | null
      assignedStaffId?: number | null
      intakeNotes?: string
    }) => request<RepairOrderResponse>('/api/staff/repair-orders/intake', { method: 'POST', body: JSON.stringify(payload) }),
  },
  admin: {
    dashboard: () => request<DashboardResponse>('/api/admin/dashboard'),
    employees: () => request<Employee[]>('/api/admin/employees'),
    createEmployee: (payload: { email: string; password: string; fullName: string; phone?: string; employeeCode: string; position?: string }) =>
      request<Employee>('/api/admin/employees', { method: 'POST', body: JSON.stringify(payload) }),
    updateEmployee: (id: number, payload: { email: string; password?: string; fullName: string; phone?: string; employeeCode: string; position?: string }) =>
      request<Employee>(`/api/admin/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteEmployee: (id: number) => request<void>(`/api/admin/employees/${id}`, { method: 'DELETE' }),
    parts: () => request<Part[]>('/api/admin/parts'),
    createPart: (payload: {
      sku: string
      name: string
      description?: string
      unitPrice: number
      quantityOnHand: number
      minStock: number
      category?: string
      active: boolean
    }) => request<Part>('/api/admin/parts', { method: 'POST', body: JSON.stringify(payload) }),
    updatePart: (
      id: number,
      payload: {
        sku: string
        name: string
        description?: string
        unitPrice: number
        quantityOnHand: number
        minStock: number
        category?: string
        active: boolean
      },
    ) => request<Part>(`/api/admin/parts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    inventoryStats: () => request<{ totalParts: number; lowStockPartsCount: number; outOfStockPartsCount: number; recentInwardCount: number }>('/api/admin/inventory/stats'),
    inventoryMovements: () => request<Array<{ id: number; sku: string; name: string; movementType: 'IN' | 'OUT' | 'ADJUST'; quantity: number; note?: string; createdAt: string }>>('/api/admin/inventory/movements'),
    services: () => request<ServiceItem[]>('/api/admin/service-catalog'),
    createService: (payload: { code: string; name: string; description?: string; basePrice: number; active: boolean }) =>
      request<ServiceItem>('/api/admin/service-catalog', { method: 'POST', body: JSON.stringify(payload) }),
    updateService: (
      id: number,
      payload: { code: string; name: string; description?: string; basePrice: number; active: boolean },
    ) => request<ServiceItem>(`/api/admin/service-catalog/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteService: (id: number) => request<void>(`/api/admin/service-catalog/${id}`, { method: 'DELETE' }),
    revenue: (from?: string, to?: string) => {
      const q = new URLSearchParams()
      if (from) q.set('from', from)
      if (to) q.set('to', to)
      return request<RevenueReport>(`/api/admin/revenue${q.size ? `?${q.toString()}` : ''}`)
    },
    notifications: () => request<NotificationSetting[]>('/api/admin/notification-settings'),
    updateNotification: (id: number, payload: { enabled: boolean; channel?: string; templateSubject?: string; templateBody?: string }) =>
      request<NotificationSetting>(`/api/admin/notification-settings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    partsRequests: () => request<Array<{ id: number; requestNumber: string; repairOrderId: number; requestedByStaffId: number; status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED'; adminNote?: string; createdAt: string; fulfilledAt?: string; lines: Array<{ id: number; partId: number; partName: string; partSku: string; quantityRequested: number; quantityIssued: number }> }>>('/api/admin/parts-requests'),
    approvePartsRequest: (id: number, adminNote?: string) => request(`/api/admin/parts-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ adminNote }) }),
    fulfillPartsRequest: (id: number, adminNote?: string) => request(`/api/admin/parts-requests/${id}/fulfill`, { method: 'POST', body: JSON.stringify({ adminNote }) }),
    rejectPartsRequest: (id: number, adminNote?: string) => request(`/api/admin/parts-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ adminNote }) }),
  },
}

