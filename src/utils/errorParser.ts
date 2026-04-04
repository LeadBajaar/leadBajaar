export type AppError = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  raw?: any;
};

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

    return {
      message: data?.message || mapStatus(error.response.status),
      status: error.response.status,
      raw: error
    };
  }

  if (error?.message) {
    return { message: error.message, raw: error };
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
