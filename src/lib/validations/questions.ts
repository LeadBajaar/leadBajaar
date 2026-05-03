export const validateQuestionResponse = (type: string, value: any, label?: string): { isValid: boolean; error?: string } => {
  // If type is text but label suggests it's a phone, treat as phone
  let effectiveType = type;
  if (type === 'text' && label) {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('phone') || lowerLabel.includes('mobile') || lowerLabel.includes('whatsapp')) {
      effectiveType = 'phone';
    }
  }

  switch (effectiveType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        isValid: emailRegex.test(value),
        error: emailRegex.test(value) ? undefined : 'Please enter a valid email address'
      }

    case 'phone':
      // Requires at least 10 digits, can have +, spaces, or dashes
      const phoneRegex = /^\+?[\d\s-]{10,}$/
      const hasDigits = /\d/.test(value);
      const isTest = /^[a-zA-Z]+$/.test(value);
      
      const isValid = phoneRegex.test(value) && hasDigits && !isTest;
      
      return {
        isValid: isValid,
        error: isValid ? undefined : 'Please enter a valid 10-digit phone number'
      }

    case 'date':
      const date = new Date(value)
      return {
        isValid: !isNaN(date.getTime()),
        error: !isNaN(date.getTime()) ? undefined : 'Please enter a valid date'
      }

    case 'time':
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      return {
        isValid: timeRegex.test(value),
        error: timeRegex.test(value) ? undefined : 'Please enter a valid time (HH:MM)'
      }

    default:
      return { isValid: true }
  }
} 