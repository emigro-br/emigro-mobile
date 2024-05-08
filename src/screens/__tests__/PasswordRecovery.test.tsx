import { Keyboard } from 'react-native';

import { useToast } from '@gluestack-ui/themed';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import * as auth from '@services/emigro/auth';

import { PasswordRecovery } from '../PasswordRecovery';

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn().mockReturnValue({ show: jest.fn() }),
}));

jest.spyOn(Keyboard, 'dismiss');

describe('PasswordRecovery', () => {
  const mockNavigation: any = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the password recovery screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<PasswordRecovery navigation={mockNavigation} />);

    expect(getByText('Password Recovery')).toBeOnTheScreen();
    expect(getByPlaceholderText('example@email.com')).toBeOnTheScreen();
  });

  it('should show error toast when email sending fails', async () => {
    const mockToastShow = useToast().show;
    const resetPassword = jest.spyOn(auth, 'resetPassword').mockRejectedValue(new Error('Email not found'));

    const { getByPlaceholderText, getByText } = render(<PasswordRecovery navigation={mockNavigation} />);

    const notFoundEmail = 'any-email@found.not'; // valid e-mail, but not found in the system
    const emailInput = getByPlaceholderText('example@email.com');
    fireEvent.changeText(emailInput, notFoundEmail);
    fireEvent.press(getByText('Send Email'));

    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
      expect(resetPassword).toHaveBeenCalledWith(notFoundEmail);
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith({
        duration: 10000,
        render: expect.any(Function),
      });
      // can't test the following expectations because the Toast component is mocked
      // expect(getByTestId('toast-1')).toBeOnTheScreen();
      // expect(getByText('Failed to reset your password')).toBeOnTheScreen();
      // expect(getByText('Could not send the recovery e-mail, please try again later.')).toBeOnTheScreen();
    });
  });

  it('should navigate to CreateNewPassword screen when email sending succeeds', async () => {
    const resetPassword = jest.spyOn(auth, 'resetPassword').mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = render(<PasswordRecovery navigation={mockNavigation} />);

    const validEmail = 'valid-email@example.com';
    const emailInput = getByPlaceholderText('example@email.com');
    fireEvent.changeText(emailInput, validEmail);
    fireEvent.press(getByText('Send Email'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith(validEmail);
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateNewPassword', {
        email: validEmail,
      });
    });
  });
});
