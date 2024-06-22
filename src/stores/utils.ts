export const waitTransaction = async (transactionId: string, fetchFn: (id: string) => Promise<any>) => {
  // Wait for payment to be processed
  let attempts = 0;
  const interval = 2000;
  const maxAttempts = 20; // 40 seconds
  let result;
  let status = 'created';

  const waitStatus = ['created', 'pending'];
  while (waitStatus.includes(status) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    result = await fetchFn(transactionId);
    console.debug('Transaction status:', result.status);
    status = result.status;
    attempts++;
  }
  return result;
};
