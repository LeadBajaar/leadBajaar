import { toCallablePhone, toWhatsAppPhone, toTelHref } from '../phone'

describe('toCallablePhone', () => {
  it('prefixes a bare 10-digit number with +91', () => {
    expect(toCallablePhone('9876543210')).toBe('+919876543210')
  })

  it('strips a leading trunk 0 before prefixing', () => {
    expect(toCallablePhone('09876543210')).toBe('+919876543210')
  })

  it('does not duplicate 91 when the number already carries the country code without a +', () => {
    expect(toCallablePhone('919876543210')).toBe('+919876543210')
  })

  it('leaves an already-international number untouched', () => {
    expect(toCallablePhone('+919876543210')).toBe('+919876543210')
    expect(toCallablePhone('+1 415 555 0132')).toBe('+1 415 555 0132')
  })

  it('strips formatting characters before prefixing', () => {
    expect(toCallablePhone('98765-43210')).toBe('+919876543210')
    expect(toCallablePhone('(987) 654-3210')).toBe('+919876543210')
  })

  it('trims surrounding whitespace', () => {
    expect(toCallablePhone('  9876543210  ')).toBe('+919876543210')
  })

  it('returns an empty string for a missing number', () => {
    expect(toCallablePhone(undefined)).toBe('')
    expect(toCallablePhone('')).toBe('')
  })
})

describe('toWhatsAppPhone', () => {
  it('matches toCallablePhone without the leading +', () => {
    expect(toWhatsAppPhone('9876543210')).toBe('919876543210')
    expect(toWhatsAppPhone('919876543210')).toBe('919876543210')
    expect(toWhatsAppPhone('+1 415 555 0132')).toBe('1 415 555 0132')
  })

  it('returns an empty string for a missing number', () => {
    expect(toWhatsAppPhone(undefined)).toBe('')
  })
})

describe('toTelHref', () => {
  it('percent-encodes the + so Android dialers do not strip it', () => {
    expect(toTelHref('9876543210')).toBe('tel:%2B919876543210')
  })

  it('normalizes before encoding, same as toCallablePhone', () => {
    expect(toTelHref('919876543210')).toBe('tel:%2B919876543210')
    expect(toTelHref('09876543210')).toBe('tel:%2B919876543210')
  })

  it('returns an empty string for a missing number', () => {
    expect(toTelHref(undefined)).toBe('')
  })
})
