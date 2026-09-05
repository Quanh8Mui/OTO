export function formatMoney(value?: number) {
  if (value == null || Number.isNaN(value)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    value,
  )
}

export function formatDate(input?: string) {
  if (!input) return '-'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return date.toLocaleString('vi-VN')
}

export const STATUS_VIETNAMESE_MAP: Record<string, string> = {
  // Repair Order Statuses
  INTAKE: 'Tiếp nhận xe',
  QUOTING: 'Lập báo giá',
  AWAITING_APPROVAL: 'Chờ khách duyệt',
  IN_PROGRESS: 'Đang sửa chữa',
  PAUSED: 'Tạm dừng',
  COMPLETED: 'Đã hoàn thành',
  DELIVERED: 'Đã bàn giao',
  CANCELLED: 'Đã hủy',

  // Booking / General Statuses
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',

  // Quote Statuses
  DRAFT: 'Bản nháp',
  SENT: 'Đã gửi khách',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Đã từ chối',
  EXPIRED: 'Đã hết hạn',

  // Payment Statuses
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  SUCCESS: 'Thành công',
  PROCESSING: 'Đang xử lý',
  FAILED: 'Thanh toán lỗi',
  REFUNDED: 'Đã hoàn tiền',

  // Parts Request Statuses
  FULFILLED: 'Đã cấp phát kho',

  // General Statuses
  NEW: 'Mới',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  DONE: 'Hoàn tất',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngưng hoạt động',
}

export function formatStatus(status?: string): string {
  if (!status) return '-'
  return STATUS_VIETNAMESE_MAP[status.toUpperCase()] || status
}

export const ROLE_VIETNAMESE_MAP: Record<string, string> = {
  CUSTOMER: 'Khách hàng',
  STAFF: 'Nhân viên kỹ thuật',
  ADMIN: 'Quản trị viên',
}

export function formatRole(role?: string): string {
  if (!role) return '-'
  return ROLE_VIETNAMESE_MAP[role.toUpperCase()] || role
}

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  CASH: 'Tiền mặt',
  CARD: 'Thẻ ngân hàng',
  BANK_TRANSFER: 'Chuyển khoản',
  ONLINE: 'Trực tuyến (VNPAY)',
}

export function formatPaymentMethod(method?: string): string {
  if (!method) return '-'
  return PAYMENT_METHOD_MAP[method.toUpperCase()] || method
}

export function getStatusBadgeClass(status?: string): string {
  if (!status) return 'badge-amber'
  const s = status.toUpperCase()
  if (['COMPLETED', 'DELIVERED', 'APPROVED', 'CONFIRMED', 'FULFILLED', 'ACTIVE'].includes(s)) {
    return 'badge-green'
  }
  if (['CANCELLED', 'REJECTED', 'FAILED', 'INACTIVE'].includes(s)) {
    return 'badge-red'
  }
  if (['IN_PROGRESS', 'SENT', 'ONLINE', 'INTAKE'].includes(s)) {
    return 'badge-blue'
  }
  if (['QUOTING', 'AWAITING_APPROVAL'].includes(s)) {
    return 'badge-purple'
  }
  return 'badge-amber'
}
