export function toBaseUnits(amount: string, decimals: number): string {
  return BigInt(parseFloat(amount) * 10 ** decimals).toString();
}