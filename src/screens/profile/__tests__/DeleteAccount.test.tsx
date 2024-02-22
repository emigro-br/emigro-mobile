import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { deleteAccount } from '@/services/auth';
import { clearSession, getSession } from '@/storage/helpers';

import DeleteAccount from '../DeleteAccount';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@/storage/helpers', () => ({
  getSession: jest.fn(),
  clearSession: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
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
    (getSession as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(<DeleteAccount />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(clearSession).toHaveBeenCalled();
      expect(useNavigation().navigate).toHaveBeenCalledWith('Welcome');
    });
  });

  it('Should navigate to Welcome screen if session is not found', async () => {
    (getSession as jest.Mock).mockResolvedValue(false);

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
    (getSession as jest.Mock).mockResolvedValue(true);
    (deleteAccount as jest.Mock).mockRejectedValue(new Error('Delete account error'));

    const { getByText } = render(<DeleteAccount />);

    const deleteButton = getByText('Yes, delete my account permanently');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(clearSession).not.toHaveBeenCalled();
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
