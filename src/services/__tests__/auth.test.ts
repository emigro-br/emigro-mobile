import mockAxios from 'jest-mock-axios';

import { IAuthSession } from '@/types/IAuthSession';
import { IConfirmUser } from '@/types/IConfirmUser';
import { IRegisterUser } from '@/types/IRegisterUser';

import { Role } from '@constants/constants';

import { confirmAccount, confirmResetPassword, deleteAccount, refresh, resetPassword, signIn, signUp } from '../auth';

describe('signIn', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = 'password';
  const mockResponse = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    idToken: 'id_token',
    tokenExpirationDate: 'expiration_date',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to sign in and return the session data if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await signIn(mockEmail, mockPassword);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
      email: mockEmail,
      password: mockPassword,
      role: Role.CUSTOMER,
    });

    expect(result).toEqual({
      accessToken: mockResponse.accessToken,
      refreshToken: mockResponse.refreshToken,
      idToken: mockResponse.idToken,
      tokenExpirationDate: mockResponse.tokenExpirationDate,
      email: mockEmail,
    });
  });
});

describe('signUp', () => {
  const mockRegisterUser: IRegisterUser = {
    email: 'test@example.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CUSTOMER,
  };
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to sign up and return the response data if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await signUp(mockRegisterUser);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', mockRegisterUser);

    expect(result).toEqual(mockResponse);
  });
});

describe('confirmAccount', () => {
  const mockConfirmUser: IConfirmUser = {
    email: 'test@example.com',
    username: 'test',
    code: '123456',
  };
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to confirm the account and return the response data if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await confirmAccount(mockConfirmUser);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/confirm', mockConfirmUser);

    expect(result).toEqual(mockResponse);
  });
});

describe('refresh', () => {
  const mockAuthSession: IAuthSession = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    idToken: 'id_token',
    tokenExpirationDate: new Date(),
    email: 'test@example.com',
  };
  const mockResponse = {
    accessToken: 'new_access_token',
    refreshToken: 'new_refresh_token',
    idToken: 'new_id_token',
    tokenExpirationDate: 'new_expiration_date',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to refresh the session and return the updated session data if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await refresh(mockAuthSession);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/refresh', mockAuthSession);

    expect(result).toEqual({
      accessToken: mockResponse.accessToken,
      refreshToken: mockResponse.refreshToken,
      idToken: mockResponse.idToken,
      tokenExpirationDate: mockResponse.tokenExpirationDate,
      email: mockAuthSession.email,
    });
  });
});

describe('deleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a DELETE request to delete the account', async () => {
    mockAxios.delete.mockResolvedValue({});
    await deleteAccount();

    expect(mockAxios.delete).toHaveBeenCalledWith('/auth');
  });
});

describe('resetPassword', () => {
  const mockEmail = 'test@example.com';
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request to reset the password and return the response data if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await resetPassword(mockEmail);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/reset-password', { email: mockEmail });

    expect(result).toEqual(mockResponse);
  });
});

describe('resetPassword', () => {
  const mockEmail = 'test@example.com';
  const mockResponse = { success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a POST request to reset password and return the JSON response if successful', async () => {
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    const result = await resetPassword(mockEmail);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/reset-password', { email: mockEmail });

    expect(result).toEqual(mockResponse);
  });

  it('should throw a error if the response was an error', async () => {
    const mockError = new Error('Invalid email');
    mockAxios.post.mockRejectedValueOnce(mockError);
    await expect(resetPassword(mockEmail)).rejects.toThrow(mockError);
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
    mockAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await confirmResetPassword(mockEmail, mockCode, mockNewPassword);

    expect(mockAxios.post).toHaveBeenCalledWith('/auth/confirm-reset-password', {
      email: mockEmail,
      code: mockCode,
      newPassword: mockNewPassword,
    });

    expect(result).toEqual(mockResponse);
  });

  it('should throw a error if the response was an error', async () => {
    const mockError = new Error('Invalid code');
    mockAxios.post.mockRejectedValueOnce(mockError);
    await expect(confirmResetPassword(mockEmail, mockCode, mockNewPassword)).rejects.toThrow(mockError);
  });
});
