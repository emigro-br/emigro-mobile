import { useNavigation } from '@react-navigation/native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { IAuthSession } from '@/types/IAuthSession';

import { deleteAccount } from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

import DeleteAccount from '../DeleteAccount';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    session: null,
    clear: jest.fn(),
  },
}));

jest.mock('@services/auth', () => ({
  getSession: jest.fn(),
  deleteAccount: jest.fn(),
  clearSession: jest.fn(),
}));

describe('DeleteAccount component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: jest.fn(),
      goBack: jest.fn(),
    });
  });

  it('Should delete account and navigate to Welcome screen', async () => {
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;
    const { getByText } = render(<DeleteAccount />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(sessionStore.clear).toHaveBeenCalled();
      expect(useNavigation().navigate).toHaveBeenCalledWith('Welcome');
    });
  });

  it('Should navigate to Welcome screen if session is not found', async () => {
    sessionStore.session = null;

    const { getByText } = render(<DeleteAccount />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).not.toHaveBeenCalled();
      expect(useNavigation().navigate).toHaveBeenCalledWith('Welcome');
    });
  });

  it('Should handle error when deleting account', async () => {
    const restoreConsole = mockConsole();
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;

    (deleteAccount as jest.Mock).mockRejectedValue(new Error('Delete account error'));

    const { getByText } = render(<DeleteAccount />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(sessionStore.clear).not.toHaveBeenCalled();
      expect(useNavigation().navigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(new Error('Delete account error'));
    });
    restoreConsole();
  });

  it('Should navigate back when "No" button is pressed', () => {
    const { getByText } = render(<DeleteAccount />);

    const noButton = getByText('No, keep my account');
    fireEvent.press(noButton);

    expect(useNavigation().goBack).toHaveBeenCalled();
  });
});
