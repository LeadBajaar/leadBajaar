export type AppError = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  raw?: any;
};

function sanitizeMessage(msg: string): string {
  if (!msg) return msg;
  if (msg.includes('SQLSTATE') || msg.includes('SQL:') || msg.includes('Connection: mysql')) {
    return "A database error occurred while processing your request. Please try again later.";
  }
  return msg;
}

export function parseError(error: any): AppError {
  if (error?.response) {
    const data = error.response.data;

    // Handle Laravel validation errors (422)
    if (error.response.status === 422 && data.errors) {
      const messages = Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('\n');
      
      return {
        message: messages || data.message || 'Validation failed',
        status: 422,
        errors: data.errors,
        raw: error
      };
    }

    const rawMessage = data?.message || mapStatus(error.response.status);
    return {
      message: sanitizeMessage(rawMessage),
      status: error.response.status,
      raw: error
    };
  }

  // Handle Axios Network Errors
  if (error?.message === 'Network Error') {
    return { 
      message: "Cannot connect to server. Please check your internet connection.",
      raw: error 
    };
  }

  if (error?.message) {
    const rawMsg = error.message === 'API Error' ? 'Something went wrong' : error.message;
    return { 
      message: sanitizeMessage(rawMsg), 
      raw: error 
    };
  }

  return {
    message: "Something went wrong. Please try again.",
    raw: error
  };
}

function mapStatus(status?: number) {
  switch (status) {
    case 400: return "Invalid request";
    case 401: return "Session expired. Login again";
    case 403: return "Permission denied";
    case 404: return "Not found";
    case 500: return "Server error. Try later";
    default: return "Unexpected error";
  }
}
