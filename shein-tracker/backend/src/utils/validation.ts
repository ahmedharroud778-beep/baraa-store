export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateOrderId(orderId: string): boolean {
  // Order ID should be at least 3 characters
  return orderId.length >= 3;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
