export function trpcErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: string }).message;
    if (message) return message;
  }
  return fallback;
}
