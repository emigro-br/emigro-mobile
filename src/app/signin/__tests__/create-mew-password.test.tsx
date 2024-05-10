import { Keyboard } from 'react-native';

import { useToast } from '@gluestack-ui/themed';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import * as auth from '@/services/emigro/auth';

import { CreateNewPassword } from '../create-new-password';

jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: jest.fn().mockReturnValue({ show: jest.fn() }),
}));

jest.spyOn(Keyboard, 'dismiss');

describe('CreateNewPassword', () => {
  const mockNavigation: any = {
    navigate: jest.fn(),
  };

  const mockRoute: any = {
    params: {
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the create new password screen correctly', async () => {
    const { getByText, getByPlaceholderText } = render(
      <CreateNewPassword navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Password Reset Code')).toBeOnTheScreen();
    expect(getByText('Enter the code you received in your email.')).toBeOnTheScreen();

    inputPIN('123456');

    await waitFor(() => {
      expect(getByText('Create New Password')).toBeOnTheScreen();
    });

    expect(getByText('Enter your new password and confirm it.')).toBeOnTheScreen();
    expect(getByPlaceholderText('at least 8 chars')).toBeOnTheScreen();
    expect(getByPlaceholderText('Confirm password')).toBeOnTheScreen();
  });

  it('should show error toast when password creation fails', async () => {
    const mockToastShow = useToast().show;
    const confirmResetPassword = jest.spyOn(auth, 'confirmResetPassword').mockRejectedValue(new Error('Invalid code'));

    const { getByPlaceholderText, getByText } = render(
      <CreateNewPassword navigation={mockNavigation} route={mockRoute} />,
    );

    inputPIN('123456');

    await waitFor(() => {
      expect(getByText('Create New Password')).toBeOnTheScreen();
    });

    const passwordInput = getByPlaceholderText('at least 8 chars');
    const confirmPasswordInput = getByPlaceholderText('Confirm password');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.changeText(confirmPasswordInput, 'password');
    fireEvent.press(getByText('Create new password'));

    await waitFor(() => {
      expect(confirmResetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'password');
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith({
        duration: 10000,
        render: expect.any(Function),
      });
    });
  });

  it('should navigate to Login screen when password creation succeeds', async () => {
    const confirmResetPassword = jest.spyOn(auth, 'confirmResetPassword').mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = render(
      <CreateNewPassword navigation={mockNavigation} route={mockRoute} />,
    );

    inputPIN('123456');

    await waitFor(() => {
      expect(getByText('Create New Password')).toBeOnTheScreen();
    });

    const passwordInput = getByPlaceholderText('at least 8 chars');
    const confirmPasswordInput = getByPlaceholderText('Confirm password');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.changeText(confirmPasswordInput, 'password');
    fireEvent.press(getByText('Create new password'));

    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
      expect(confirmResetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'password');
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});
