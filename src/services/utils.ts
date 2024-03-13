import { NotAuhtorized } from '../types/errors';

export const fetchWithTokenCheck = async (url: string, options: RequestInit): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sessionStore } = require('@stores/SessionStore'); // workaround to avoid circular dependency
  if (!sessionStore.session) {
    throw new NotAuhtorized();
  }

  if (sessionStore.isTokenExpired) {
    console.debug('Token expired, refreshing...');
    const newSession = await sessionStore.refresh();
    if (!newSession) {
      throw new Error('Could not refresh session');
    }
  }

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${sessionStore.accessToken}`,
  };

  return fetch(url, options);
};
