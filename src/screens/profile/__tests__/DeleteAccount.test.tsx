import { useToast } from '@gluestack-ui/themed';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { deleteAccount } from '@services/emigro/auth';
import { AuthSession } from '@services/emigro/types';

import { sessionStore } from '@stores/SessionStore';

import DeleteAccount from '../DeleteAccount';

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn().mockReturnValue({ show: jest.fn() }),
}));

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    session: null,
    clear: jest.fn(),
  },
}));

jest.mock('@services/emigro/auth', () => ({
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
    } as AuthSession;
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

  it('Should handle error when deleting account fail', async () => {
    const mockToastShow = useToast().show;
    sessionStore.session = {
      accessToken: 'accessToken',
    } as AuthSession;

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
      expect(mockToastShow).toHaveBeenCalledWith({
        duration: 10000,
        render: expect.any(Function),
      });
    });
  });

  it('Should navigate back when "No" button is pressed', () => {
    const { getByText } = render(<DeleteAccount navigation={mockNavigattion} />);

    const noButton = getByText('No, keep my account');
    fireEvent.press(noButton);

    expect(mockNavigattion.popToTop).toHaveBeenCalled();
  });
});
