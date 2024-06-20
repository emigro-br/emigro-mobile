import { screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { inputPIN, render } from 'test-utils';

import { securityStore } from '@/stores/SecurityStore';

import { UnlockScreen } from '../(auth)/unlock';

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

describe('UnlockScreen component', () => {
  it('should navigate to "Root" when unlocked is true', async () => {
    const router = useRouter();
    jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);

    render(<UnlockScreen />);
    expect(screen.getByText('Enter your PIN')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalledWith('/');

    inputPIN('1234');

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/');
      expect(securityStore.verifyPin).toHaveBeenCalledWith('1234');
    });
  });
});
