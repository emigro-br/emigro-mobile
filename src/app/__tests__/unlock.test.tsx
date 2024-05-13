import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { screen, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { securityStore } from '@/stores/SecurityStore';

import { UnlockScreen } from '../(auth)/unlock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

describe('UnlockScreen component', () => {
  const navigation: any = {
    replace: jest.fn(),
  };

  it('should navigate to "Root" when unlocked is true', async () => {
    jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);

    render(<UnlockScreen navigation={navigation} />);
    expect(screen.getByText('Enter your PIN')).toBeOnTheScreen();
    expect(navigation.replace).not.toHaveBeenCalledWith('Root');

    inputPIN('1234');

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('Root');
      expect(securityStore.verifyPin).toHaveBeenCalledWith('1234');
    });
  });
});
