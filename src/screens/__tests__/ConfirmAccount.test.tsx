import * as Sentry from '@sentry/react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { CONFIRM_ACCOUNT_ERROR } from '@constants/errorMessages';

import * as auth from '@services/auth';

import ConfirmAccount from '../signup/ConfirmAccount';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

const mockNavigation: any = {
  navigate: jest.fn(),
};

const mockRoute: any = {
  params: {
    email: 'example@example.com',
    username: 'example_username',
  },
};

describe('ConfirmAccount component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('Should handle confirmation with success', async () => {
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
    const confirmAccount = jest.spyOn(auth, 'confirmAccount');
    confirmAccount.mockResolvedValue(mockResponse);

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <ConfirmAccount navigation={mockNavigation} route={mockRoute} />,
    );

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, '123456');

    const confirmButton = getByText('Confirm Account');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toBeUndefined();
      expect(confirmAccount).toHaveBeenCalled();
    });
  });

  it('Should handle error from confirmAccount', async () => {
    jest.spyOn(auth, 'confirmAccount').mockRejectedValue(CONFIRM_ACCOUNT_ERROR);

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <ConfirmAccount navigation={mockNavigation} route={mockRoute} />,
    );

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, '654321');

    const confirmButton = getByText('Confirm Account');

    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toEqual(CONFIRM_ACCOUNT_ERROR);
    });

    // check sentry
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
