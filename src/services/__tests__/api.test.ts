import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { withRefreshTokenInterceptor } from '../api';

describe('withRefreshTokenInterceptor', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
  });

  it('should add the refresh token interceptor to the axios instance', async () => {
    const refreshFn = jest.fn().mockResolvedValue('newAccessToken');
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
    const refreshFn = jest.fn().mockResolvedValue('newAccessToken');
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 401 response
    mock.onGet('/protected').replyOnce(401);

    // Mock a successful response after refreshing the token
    mock.onGet('/protected').replyOnce(200, { data: 'protectedData' });

    // Make a request to the protected endpoint
    const response = await instance.get('/protected');

    // Verify that the refresh function was called
    expect(refreshFn).toHaveBeenCalled();

    // Verify that the original request was retried and successful
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'protectedData' });
  });

  it('should throw an error if the refresh function fails', async () => {
    const refreshFn = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 401 response
    mock.onGet('/protected').replyOnce(401);

    // Make a request to the protected endpoint
    await expect(instance.get('/protected')).rejects.toThrow('Refresh failed');
    expect(refreshFn).toHaveBeenCalled();
  });

  it('should throw an error if the response contains a custom error', async () => {
    const refreshFn = jest.fn().mockResolvedValue('newAccessToken');
    withRefreshTokenInterceptor(instance, refreshFn);

    // Mock a 500 response with a custom error
    mock.onGet('/protected').replyOnce(500, { error: { message: 'Unauthorized' } });

    // Make a request to the protected endpoint
    await expect(instance.get('/protected')).rejects.toThrow('Unauthorized');
  });
});
