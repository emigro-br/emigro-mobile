import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { sessionStore } from '@/stores/SessionStore';

import { api, withRefreshTokenInterceptor } from '../api';
import { AuthSession } from '../types';

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    session: true,
    accessToken: 'testAccessToken',
    refresh: jest.fn().mockResolvedValue('newAccessToken'),
  },
}));

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an axios instance with the provided configuration', () => {
    const config: CreateAxiosDefaults = {
      baseURL: 'https://api.example.com',
      timeout: 5000,
    };

    const result = api(config);

    expect(result.defaults.baseURL).toBe('https://api.example.com');
    expect(result.defaults.timeout).toBe(5000);
  });

  it('should not set the Authorization header if session doesnt exists', () => {
    sessionStore.session = null;
    const result = api();

    expect(result.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('should set the Authorization header if session exists', () => {
    sessionStore.session = { accessToken: 'testAccessToken' } as AuthSession;
    const result = api();

    expect(result.defaults.headers.common['Authorization']).toBe('Bearer testAccessToken');
  });
});

describe('withRefreshTokenInterceptor', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;
  const newSession = { accessToken: 'newAccessToken' } as AuthSession;

  beforeEach(() => {
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
  });

  it('should add the refresh token interceptor to the axios instance', async () => {
    const refreshFn = jest.fn().mockResolvedValueOnce(newSession);
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 401 and 200 response
    mock.onGet('/protected').replyOnce(401);
    mock.onGet('/protected').replyOnce(200);

    // Make a request to the protected endpoint
    await instance.get('/protected');

    // Verify that the refresh function was called
    expect(refreshFn).toHaveBeenCalled();

    // Verify that the access token was updated in the headers
    expect(instance.defaults.headers.common['Authorization']).toBe('Bearer newAccessToken');
  });

  it('should retry the original request after refreshing the token', async () => {
    const refreshFn = jest.fn().mockResolvedValueOnce(newSession);
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 401 response
    mock.onGet('/protected').replyOnce(401);

    // Mock a successful response after refreshing the token
    mock.onGet('/protected').replyOnce(200, { data: 'protectedData' });

    // Make a request to the protected endpoint
    const response = await instance.get('/protected');

    // Verify that the refresh function was called
    expect(refreshFn).toHaveBeenCalledTimes(1);

    // Verify that the original request was retried and successful
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'protectedData' });
  });

  it('should retry to refresh the token only one time', async () => {
    const refreshFn = jest.fn().mockResolvedValueOnce(newSession);
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock to always 401 response
    mock.onGet('/protected').reply(401);

    // Make a request to the protected endpoint
    await expect(instance.get('/protected')).rejects.toThrow('Request failed with status code 401');

    // Verify that the refresh function was called only once
    expect(refreshFn).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if the refresh function fails', async () => {
    const refreshFn = jest.fn().mockRejectedValueOnce(new Error('Refresh failed'));
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 401 response
    mock.onGet('/protected').replyOnce(401);

    // Make a request to the protected endpoint
    await expect(instance.get('/protected')).rejects.toThrow('Refresh failed');
    expect(refreshFn).toHaveBeenCalled();
  });

  it('should throw an error if the response contains a custom error', async () => {
    const refreshFn = jest.fn().mockResolvedValueOnce(newSession);
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 500 response with a custom error
    mock.onGet('/protected').replyOnce(500, { error: { message: 'Unauthorized' } });

    // Make a request to the protected endpoint
    await expect(instance.get('/protected')).rejects.toThrow('Unauthorized');
  });
});
