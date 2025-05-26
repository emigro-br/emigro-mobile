type WaitOptions = {
  transactionId: string;
  fetchFn: (id: string) => Promise<any>;
  initialDelay?: number;
  interval?: number;
  maxAttempts?: number;
};

export const waitTransaction = async ({
  transactionId,
  fetchFn,
  initialDelay = 0,
  interval = 1000,
  maxAttempts = 20,
}: WaitOptions) => {
  // Wait for payment to be processed
  let attempts = 0;
  let result;
  let status = 'created';

  // Initial delay
  await new Promise((resolve) => setTimeout(resolve, initialDelay));

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
