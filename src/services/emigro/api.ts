import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';

import { CustomError } from '@/types/errors';

import { AuthSession } from './types';

export const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const defaultTimeout = 10000;

export const api = (config: CreateAxiosDefaults = {}): AxiosInstance => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sessionStore } = require('@/stores/SessionStore'); // workaround to avoid circular dependency

  const instance = axios.create({
    baseURL: backendUrl,
    timeout: defaultTimeout,
    ...config,
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

export function withRefreshTokenInterceptor(instance: AxiosInstance, refreshFn: () => Promise<AuthSession>) {
  let isRefreshing = false;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (!response) {
        throw error;
      }

      const originalRequest = config;

      const Unauthorized = 401;
      if (response.status === Unauthorized && !originalRequest._retry) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newSession = await refreshFn();
            if (newSession) {
              const { accessToken } = newSession;
              instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
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
