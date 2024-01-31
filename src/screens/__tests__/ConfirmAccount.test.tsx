import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ConfirmAccount from '../welcome/ConfirmAccount';
import * as auth from '@/services/auth';
import { CONFIRM_ACCOUNT_ERROR } from '@constants/errorMessages';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn().mockResolvedValue([
    ['email', 'example@example.com'],
    ['username', 'example_username'],
  ]),
}));

const mockResponse = {
  id: 1,
  username: 'example_username',
  publicKey: 'public_key_value',
  secretKey: 'secret_key_value',
  role: 'user',
  status: 'active',
  createdAt: '2022-01-01',
  updatedAt: '2022-01-01',
};

describe('ConfirmAccount component', () => {

  it('Should handle confirmation with success', async () => {
    const confirmAccount = jest.spyOn(auth, 'confirmAccount');
    confirmAccount.mockResolvedValue(mockResponse);

    const { getByPlaceholderText, getByText, getByTestId } = render(<ConfirmAccount navigation={{}} />);

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, '123456');

    const confirmButton = getByText('Confirm Account');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(confirmAccount).toHaveBeenCalled();
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toBeUndefined();
    });
  });

  it('Should handle error from confirmAccount', async () => {
    const consoleMock = jest.spyOn(global.console, "error").mockImplementation(() => {});
    jest.spyOn(auth, 'confirmAccount').mockRejectedValue(CONFIRM_ACCOUNT_ERROR);

    const { getByPlaceholderText, getByText, getByTestId } = render(<ConfirmAccount navigation={{}} />);

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, '654321');

    const confirmButton = getByText('Confirm Account');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toEqual(CONFIRM_ACCOUNT_ERROR);
      expect(consoleMock).toHaveBeenCalledWith(CONFIRM_ACCOUNT_ERROR);
    });
  });
});
