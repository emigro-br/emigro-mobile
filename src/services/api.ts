import axios, { AxiosInstance } from 'axios';

import { CustomError } from '@/types/errors';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const defaultTimeout = 10000;

export const api = (): AxiosInstance => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sessionStore } = require('@stores/SessionStore'); // workaround to avoid circular dependency

  const instance = axios.create({
    baseURL: backendUrl,
    timeout: defaultTimeout,
  });

  // Alter defaults after instance has been created
  // axios.defaults.headers.post['Content-Type'] = 'application/json';
  if (sessionStore.session) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${sessionStore.accessToken}`;
  }

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Do something with response error
      if (error.response.data?.error) {
        throw CustomError.fromJSON(error.response.data.error);
      }
      throw error;
    },
  );

  return instance;
};
