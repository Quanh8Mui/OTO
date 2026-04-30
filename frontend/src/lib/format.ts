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

