import { renderHook, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { IAuthSession } from '@services/emigro/types';

import { sessionStore } from '@stores/SessionStore';

import { useSession } from '../useSession';

const mockSession = { accessToken: 'abc123' } as IAuthSession;

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    load: jest.fn(),
    refresh: jest.fn(),
    fetchProfile: jest.fn(),
    clear: jest.fn(),
    get session() {
      return null;
    },
  },
}));

describe('useSession', () => {
  const restoreConsole = mockConsole();

  afterAll(() => {
    restoreConsole();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (sessionStore.load as jest.Mock).mockResolvedValue(mockSession);
  });

  it('should set isLoading to true initially', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.isLoading).toBe(true);
  });

  it('should call sessionStore.load on mount', () => {
    renderHook(() => useSession());
    expect(sessionStore.load).toHaveBeenCalledTimes(1);
  });

  describe('when session exists', () => {
    it('should set isLoading to false after loading is complete', async () => {
      // spy session
      jest.spyOn(sessionStore, 'session', 'get').mockReturnValue(mockSession);

      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(true);
      // expect(result.current.session).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.session).toEqual(mockSession);
      });
    });

    it('should call sessionStore.refresh and sessionStore.fetchProfile', async () => {
      (sessionStore.refresh as jest.Mock).mockResolvedValueOnce(mockSession);
      const { result } = renderHook(() => useSession());

      await waitFor(() => result.current.isLoading === false);
      expect(sessionStore.refresh).toHaveBeenCalledTimes(1);
      expect(sessionStore.fetchProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('when an error occurs during loading', () => {
    beforeEach(() => {
      (sessionStore.load as jest.Mock).mockRejectedValueOnce(new Error('Failed to load session'));
    });

    it('should call sessionStore.clear', async () => {
      const { result } = renderHook(() => useSession());
      await waitFor(() => result.current.isLoading === false);

      expect(sessionStore.clear).toHaveBeenCalledTimes(1);
    });
  });
});
