import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { IAuthSession } from '@/types/IAuthSession';
import { IConfirmUser } from '@/types/IConfirmUser';
import { IRegisterUser } from '@/types/IRegisterUser';

import { Role } from '@constants/constants';

import { api } from '@services/emigro/api';

import { confirmAccount, confirmResetPassword, deleteAccount, refresh, resetPassword, signIn, signUp } from '../auth';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('auth service', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  describe('signIn', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password';
    const mockResponse = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      tokenExpirationDate: 'expiration_date',
    };

    it('should make a POST request to sign in and return the session data if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/login').reply(200, mockResponse);
      const result = await signIn(mockEmail, mockPassword);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/login', {
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

    it('should make a POST request to sign up and return the response data if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/register').reply(200, mockResponse);
      const result = await signUp(mockRegisterUser);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/register', mockRegisterUser);

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

    it('should make a POST request to confirm the account and return the response data if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/confirm').reply(200, mockResponse);
      const result = await confirmAccount(mockConfirmUser);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/confirm', mockConfirmUser);

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

    it('should make a POST request to refresh the session and return the updated session data if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/refresh').reply(200, mockResponse);
      const result = await refresh(mockAuthSession);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/refresh', mockAuthSession);

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
    it('should make a DELETE request to delete the account', async () => {
      const axiosDelete = jest.spyOn(instance, 'delete');
      mock.onDelete('/auth').reply(200);
      await deleteAccount();

      expect(axiosDelete).toHaveBeenCalledWith('/auth');
    });
  });

  describe('resetPassword', () => {
    const mockEmail = 'test@example.com';
    const mockResponse = { success: true };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should make a POST request to reset the password and return the response data if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/reset-password').reply(200, mockResponse);
      const result = await resetPassword(mockEmail);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/reset-password', { email: mockEmail });

      expect(result).toEqual(mockResponse);
    });

    it('should throw a error if the response was an error', async () => {
      mock.onPost('/auth/reset-password').reply(500);
      await expect(resetPassword(mockEmail)).rejects.toThrow();
    });
  });

  describe('confirmResetPassword', () => {
    const mockEmail = 'test@example.com';
    const mockCode = '123456';
    const mockNewPassword = 'newPassword';
    const mockResponse = { success: true };

    it('should make a POST request confirm reset code and return the JSON response if successful', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/auth/confirm-reset-password').reply(200, mockResponse);
      const result = await confirmResetPassword(mockEmail, mockCode, mockNewPassword);

      expect(mockAxiosPost).toHaveBeenCalledWith('/auth/confirm-reset-password', {
        email: mockEmail,
        code: mockCode,
        newPassword: mockNewPassword,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw a error if the response was an error', async () => {
      mock.onPost('/auth/confirm-reset-password').reply(500);
      await expect(confirmResetPassword(mockEmail, mockCode, mockNewPassword)).rejects.toThrow();
    });
  });
});
