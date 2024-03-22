import { CustomError } from '@/types/errors';

import { confirmResetPassword, resetPassword } from '../auth';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

describe('resetPassword', () => {
  const mockEmail = 'test@example.com';
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to reset password and return the JSON response if successful', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const result = await resetPassword(mockEmail);

    expect(fetchSpy).toHaveBeenCalledWith(`${backendUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: mockEmail }),
    });

    expect(result).toEqual(mockResponse);
  });

  it('should throw a CustomError if the response contains an error', async () => {
    const mockError = { message: 'Invalid email' };
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ error: mockError }),
    } as unknown as Response);

    await expect(resetPassword(mockEmail)).rejects.toThrow(CustomError.fromJSON(mockError));

    expect(fetchSpy).toHaveBeenCalledWith(`${backendUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: mockEmail }),
    });
  });
});

describe('confirmResetPassword', () => {
  const mockEmail = 'test@example.com';
  const mockCode = '123456';
  const mockNewPassword = 'newPassword';
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request confirm reset code and return the JSON response if successful', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const result = await confirmResetPassword(mockEmail, mockCode, mockNewPassword);

    expect(fetchSpy).toHaveBeenCalledWith(`${backendUrl}/auth/confirm-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: mockEmail, code: mockCode, newPassword: mockNewPassword }),
    });

    expect(result).toEqual(mockResponse);
  });

  it('should throw a CustomError if the response contains an error', async () => {
    const mockError = { message: 'Invalid code' };
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ error: mockError }),
    } as unknown as Response);

    await expect(confirmResetPassword(mockEmail, mockCode, mockNewPassword)).rejects.toThrowError(
      CustomError.fromJSON(mockError),
    );

    expect(fetchSpy).toHaveBeenCalledWith(`${backendUrl}/auth/confirm-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: mockEmail, code: mockCode, newPassword: mockNewPassword }),
    });
  });
});
