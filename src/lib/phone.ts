/**
 * Prefixes a bare local number with India's country code for dialing/WhatsApp.
 * Leaves already-international numbers (+..) untouched. If the stored number
 * already carries a "91" country code (or a leading trunk "0") without a "+",
 * that gets stripped first so the result is always +91 followed by exactly
 * the 10-digit local number, never a duplicated "91".
 */
export const toCallablePhone = (phone?: string): string => {
  if (!phone) return ''
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) return trimmed
  const digits = trimmed.replace(/\D/g, '')
  const local = digits.length > 10 ? digits.slice(-10) : digits
  return `+91${local}`
}

/** Same normalized number without the leading "+", formatted for wa.me links. */
export const toWhatsAppPhone = (phone?: string): string => toCallablePhone(phone).replace('+', '')

/**
 * A `tel:` URI for the given number, ready to drop straight into an href.
 * Android dialers sometimes strip a literal "+" because they parse it as a
 * space, so it's percent-encoded as %2B here.
 */
export const toTelHref = (phone?: string): string => {
  const callable = toCallablePhone(phone)
  return callable ? `tel:${callable.replace('+', '%2B')}` : ''
}
