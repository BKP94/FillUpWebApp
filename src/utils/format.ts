export const number = (value: number, digits = 0) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(
    value,
  )
export const baht = (value: number) => `฿${number(value, 2)}`
export const dateLabel = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(
    new Date(value),
  )
export const monthKey = (value: string) => {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
export const monthLabel = (key: string) =>
  new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date(`${key}-01T12:00:00`))
export const inputDate = (value = new Date()) =>
  new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
