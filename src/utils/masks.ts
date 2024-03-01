export const maskWallet = (address: string, size: number = 5): string => {
  if (address.length < size * 2 + 1) {
    return address;
  }
  const firstFive = address.slice(0, size);
  const lastFive = address.slice(-size);
  return `${firstFive}...${lastFive}`;
};
