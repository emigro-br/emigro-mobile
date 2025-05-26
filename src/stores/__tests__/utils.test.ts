import { waitTransaction } from '../utils';

describe('waitTransaction', () => {
  const transactionId = '12345';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wait for the transaction to be processed and return the result', async () => {
    const mockResult = { status: 'processed', data: 'transactionData' };
    const mockFetchFn = jest.fn();
    mockFetchFn.mockResolvedValueOnce({ status: 'created' });
    mockFetchFn.mockResolvedValue(mockResult);

    const result = await waitTransaction({
      transactionId,
      fetchFn: mockFetchFn,
      interval: 1,
      maxAttempts: 2,
    });

    expect(mockFetchFn).toHaveBeenCalledTimes(2); // 1 initial fetch + 1 retry
    expect(result).toEqual(mockResult);
  });

  it('should stop waiting if the transaction status is not "created" or "pending"', async () => {
    const mockResult = { status: 'failed', error: 'transactionFailed' };
    const mockFetchFn = jest.fn().mockResolvedValue(mockResult);

    const result = await waitTransaction({
      transactionId,
      fetchFn: mockFetchFn,
      interval: 1,
      maxAttempts: 5,
    });

    expect(mockFetchFn).toHaveBeenCalledTimes(1); // Only 1 initial fetch
    expect(result).toEqual(mockResult);
  });

  it('should stop waiting if the maximum number of attempts is reached', async () => {
    const mockResult = { status: 'pending' };
    const mockFetchFn = jest.fn().mockResolvedValue(mockResult);

    const result = await waitTransaction({
      transactionId,
      fetchFn: mockFetchFn,
      interval: 1,
      maxAttempts: 3,
    });

    expect(mockFetchFn).toHaveBeenCalledTimes(3); // 3 attempts
    expect(result).toEqual(mockResult);
  });

  it('should wait for the initial delay before making the first fetch', async () => {
    const mockResult = { status: 'created' };
    const mockFetchFn = jest.fn().mockResolvedValue(mockResult);

    const startTime = Date.now();
    await waitTransaction({
      transactionId,
      fetchFn: mockFetchFn,
      initialDelay: 100,
      interval: 1,
      maxAttempts: 5,
    });
    const endTime = Date.now();

    expect(mockFetchFn).toHaveBeenCalledTimes(5); // 5 retries
    expect(endTime - startTime).toBeGreaterThanOrEqual(100); // Delay of at least 2000ms
  });
});
