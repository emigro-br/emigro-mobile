import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { screen, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { sessionStore } from '@stores/SessionStore';

import { UnlockScreen } from '../unlock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    verifyPin: jest.fn(),
  },
}));

describe('UnlockScreen component', () => {
  const navigation: any = {
    replace: jest.fn(),
  };

  it('should navigate to "Root" when unlocked is true', async () => {
    jest.spyOn(sessionStore, 'verifyPin').mockResolvedValueOnce(true);

    render(<UnlockScreen navigation={navigation} />);
    expect(screen.getByText('Enter your PIN')).toBeOnTheScreen();
    expect(navigation.replace).not.toHaveBeenCalledWith('Root');

    inputPIN('1234');

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('Root');
      expect(sessionStore.verifyPin).toHaveBeenCalledWith('1234');
    });
  });
});
