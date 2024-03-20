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

  it('Should delete account and clear the session', async () => {
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;
    const { getByText, getByTestId } = render(<DeleteAccount navigation={mockNavigattion} />);

    const checkbox = getByTestId('checkbox');
    const deleteButton = getByText('Yes, delete my account permanently');
    expect(checkbox).toBeOnTheScreen();
    expect(
      getByText('I have read and understand the risks associated with deleting my account permanently.'),
    ).toBeOnTheScreen();
    expect(deleteButton).toBeOnTheScreen();

    // expect(deleteButton).toHaveAccessibilityState({ disabled: true });

    fireEvent.press(checkbox);

    expect(deleteButton).toHaveAccessibilityState({ disabled: false });
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalledWith();
      expect(sessionStore.clear).toHaveBeenCalled();
    });
  });

  it('Should handle error when deleting account', async () => {
    const restoreConsole = mockConsole();
    sessionStore.session = {
      accessToken: 'accessToken',
    } as IAuthSession;

    const error = new Error('Delete account error');
    (deleteAccount as jest.Mock).mockRejectedValue(error);

    const { getByText, getByTestId } = render(<DeleteAccount navigation={mockNavigattion} />);

    const checkbox = getByTestId('checkbox');
    fireEvent.press(checkbox);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(sessionStore.clear).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(error);
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
