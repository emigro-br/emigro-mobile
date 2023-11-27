import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import ConfirmAccount from '../welcome/ConfirmAccount';

import * as cognito from '@/services/cognito';

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

it('Should handle confirmation with success', async () => {
  const confirmAccount = jest.spyOn(cognito, 'confirmAccount');
  confirmAccount.mockResolvedValue(mockResponse);

  const { getByPlaceholderText, getByText, getByTestId } = render(<ConfirmAccount navigation={{}} />);

  const confirmationCodeInput = getByPlaceholderText('Confirmation code');
  fireEvent.changeText(confirmationCodeInput, '123456');

  const confirmButton = getByText('Confirm Account');
  fireEvent.press(confirmButton);

  await waitFor(() => {
    expect(confirmAccount).toHaveBeenCalled();
    const { children } = getByTestId('error');
    expect(children[0]).toBeUndefined();
  });
});

it('Should handle error from confirmAccount', async () => {
  jest.spyOn(cognito, 'confirmAccount').mockRejectedValue(CONFIRM_ACCOUNT_ERROR);

  const { getByPlaceholderText, getByText, getByTestId } = render(<ConfirmAccount navigation={{}} />);

  const confirmationCodeInput = getByPlaceholderText('Confirmation code');
  fireEvent.changeText(confirmationCodeInput, '654321');

  const confirmButton = getByText('Confirm Account');
  fireEvent.press(confirmButton);

  await waitFor(() => {
    const { children } = getByTestId('error');
    expect(children[0]).toEqual(CONFIRM_ACCOUNT_ERROR);
  });
});
