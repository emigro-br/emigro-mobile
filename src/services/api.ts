import axios, { AxiosInstance } from 'axios';

import { CustomError } from '@/types/errors';

export const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const defaultTimeout = 10000;

export const api = (): AxiosInstance => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sessionStore } = require('@stores/SessionStore'); // workaround to avoid circular dependency

  const instance = axios.create({
    baseURL: backendUrl,
    timeout: defaultTimeout,
  });

  // Alter defaults after instance has been created
  if (sessionStore.session) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${sessionStore.accessToken}`;
  }

  withRefreshTokenInterceptor(instance, sessionStore.refresh);

  if (process.env.DEBUG === 'axios') {
    withDebug(instance);
  }

  return instance;
};

const withDebug = (instance: AxiosInstance) => {
  instance.interceptors.request.use((request) => {
    console.debug('Starting Request', JSON.stringify(request, null, 2));
    return request;
  });

  instance.interceptors.response.use((response) => {
    console.debug('Response:', JSON.stringify(response, null, 2));
    return response;
  });
};

export function withRefreshTokenInterceptor(instance: AxiosInstance, refreshFn: () => Promise<string>) {
  let isRefreshing = false;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (!response) {
        throw error;
      }

      const originalRequest = config;

      if (response.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newSession = await refreshFn();
            if (newSession) {
              instance.defaults.headers.common['Authorization'] = `Bearer ${newSession}`;
              originalRequest.headers['Authorization'] = `Bearer ${newSession}`;
              isRefreshing = false;
            }
          } catch (err) {
            throw err;
          } finally {
            isRefreshing = false;
          }
        }

        if (!originalRequest._retry) {
          originalRequest._retry = true;
          return instance(originalRequest);
        }
      }

      if (error.response.data?.error) {
        throw CustomError.fromJSON(error.response.data.error);
      }
      throw error;
    },
  );
}
