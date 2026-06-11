export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}
