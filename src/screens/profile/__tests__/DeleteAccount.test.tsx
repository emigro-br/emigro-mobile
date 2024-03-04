import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { IAuthSession } from '@/types/IAuthSession';

import { deleteAccount } from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

import DeleteAccount from '../DeleteAccount';

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

const mockNavigattion: any = {
  push: jest.fn(),
  popToTop: jest.fn(),
};

describe('DeleteAccount component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should delete account and navigate to Welcome screen', async () => {
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;
    const { getByText } = render(<DeleteAccount navigation={mockNavigattion} />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(sessionStore.clear).toHaveBeenCalled();
    });
  });

  it('Should navigate to Welcome screen if session is not found', async () => {
    sessionStore.session = null;

    const { getByText } = render(<DeleteAccount navigation={mockNavigattion} />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).not.toHaveBeenCalled();
    });
  });

  it('Should handle error when deleting account', async () => {
    const restoreConsole = mockConsole();
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;

    (deleteAccount as jest.Mock).mockRejectedValue(new Error('Delete account error'));

    const { getByText } = render(<DeleteAccount navigation={mockNavigattion} />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(sessionStore.clear).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(new Error('Delete account error'));
    });
    restoreConsole();
  });

  it('Should navigate back when "No" button is pressed', () => {
    const { getByText } = render(<DeleteAccount navigation={mockNavigattion} />);

    const noButton = getByText('No, keep my account');
    fireEvent.press(noButton);

    expect(mockNavigattion.popToTop).toHaveBeenCalled();
  });
});
