import { IAuthSession } from '@/types/IAuthSession';
import { InvalidSessionError, NotAuhtorized } from '@/types/errors';

import * as authService from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

import { fetchWithTokenCheck } from '../utils';

describe('fetchWithTokenCheck', () => {
  const pastDate = new Date('01-01-1990');
  const futureDate = new Date('01-01-2050');
  const mockUrl = 'https://example.com/api';
  const mockOptions = { method: 'GET' };
  const mockOldSession = {
    accessToken: 'oldToken',
    tokenExpirationDate: pastDate,
  } as IAuthSession;

  const mockNewSession = {
    accessToken: 'newToken',
    tokenExpirationDate: futureDate,
  } as IAuthSession;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotAuhtorized error if session is not available', async () => {
    sessionStore.session = null;
    await expect(fetchWithTokenCheck(mockUrl, mockOptions)).rejects.toThrow(NotAuhtorized);
  });

  it('should not refresh session and add Authorization header if token is not expired', async () => {
    sessionStore.session = {
      accessToken: 'okToken',
      tokenExpirationDate: futureDate,
    } as IAuthSession;
    const mockRefreshFn = jest.spyOn(sessionStore, 'refresh');

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response());

    await fetchWithTokenCheck(mockUrl, mockOptions);

    expect(mockRefreshFn).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(mockUrl, {
      ...mockOptions,
      headers: {
        Authorization: 'Bearer okToken',
      },
    });
  });

  it('should refresh session if token is expired', async () => {
    sessionStore.session = mockOldSession;
    const mockRefreshedSession = mockNewSession;
    const mockRefreshFn = jest.spyOn(authService, 'refresh').mockResolvedValueOnce(mockRefreshedSession);
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response());

    await fetchWithTokenCheck(mockUrl, mockOptions);

    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(mockUrl, {
      ...mockOptions,
      headers: {
        Authorization: 'Bearer newToken',
      },
    });
  });

  it('should throw an error if session refresh fails with error', async () => {
    sessionStore.session = mockOldSession;

    const error = new InvalidSessionError();
    const mockRefreshFn = jest.spyOn(sessionStore, 'refresh').mockRejectedValue(error);

    await expect(fetchWithTokenCheck(mockUrl, mockOptions)).rejects.toThrow(error);
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if session refresh fails', async () => {
    sessionStore.session = mockOldSession;

    const mockRefreshFn = jest.spyOn(sessionStore, 'refresh').mockResolvedValue(undefined);

    await expect(fetchWithTokenCheck(mockUrl, mockOptions)).rejects.toThrow(Error);
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });
});
