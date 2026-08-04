// src/lib/parseApiError.ts

export const getApiErrorMessage = (error: any): string => {
  const responseData = error?.response?.data;

  if (!responseData) {
    return error?.message || "An unexpected error occurred. Please try again.";
  }

  // 1. If it's a string message
  if (typeof responseData === "string") {
    return responseData;
  }

  // 2. Standard DRF detail key (e.g., { "detail": "Authentication credentials..." })
  if (responseData.detail) {
    return typeof responseData.detail === "string"
      ? responseData.detail
      : JSON.stringify(responseData.detail);
  }

  // 3. Field-level validation errors (e.g., { "booking": ["You have already submitted..."] })
  if (typeof responseData === "object") {
    const errorMessages: string[] = [];

    Object.entries(responseData).forEach(([key, value]) => {
      // Capitalize field name (e.g., "booking" -> "Booking")
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1);

      if (Array.isArray(value)) {
        errorMessages.push(`${fieldName}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        errorMessages.push(`${fieldName}: ${value}`);
      }
    });

    if (errorMessages.length > 0) {
      return errorMessages.join(" | ");
    }
  }

  return "Failed to submit. Please check your input.";
};