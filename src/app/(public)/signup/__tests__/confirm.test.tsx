import * as Sentry from '@sentry/react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { render } from 'test-utils';

import { CONFIRM_ACCOUNT_ERROR } from '@/constants/errorMessages';
import * as auth from '@/services/emigro/auth';
import { Role, User } from '@/services/emigro/types';

import ConfirmAccount from '../confirm';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('ConfirmAccount component', () => {
  const params = {
    email: 'example@example.com',
    externalId: 'example_external_id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useLocalSearchParams as jest.Mock).mockReturnValue(params);
  });

  it('Should render correctly', async () => {
    const { getByPlaceholderText, getByText } = render(<ConfirmAccount />);
    const { email } = params;
    expect(getByText('Enter Confirmation Code')).toBeOnTheScreen();
    expect(getByText(`Enter the confirmation code we sent to ${email}:`)).toBeOnTheScreen();

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    expect(confirmationCodeInput).toBeOnTheScreen();

    const confirmButton = getByText('Verify');
    expect(confirmButton).toBeOnTheScreen();
    await waitFor(() => {
      expect(confirmButton).not.toHaveAccessibilityState({ disabled: true });
    });
  });

  it('Should handle confirmation with success', async () => {
    const mockResponse: User = {
      id: 'uid',
      externalId: 'example_external_id',
      publicKey: 'public_key_value',
      secretKey: 'secret_key_value',
      role: Role.CUSTOMER,
      status: 'active',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-01',
      preferences: {},
    };
    const confirmAccount = jest.spyOn(auth, 'confirmAccount');
    confirmAccount.mockResolvedValue(mockResponse);

    const { getByPlaceholderText, getByTestId } = render(<ConfirmAccount />);

    const code = '123456';
    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, code);

    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    const { email, externalId } = params;
    await waitFor(() => {
      expect(confirmAccount).toHaveBeenCalledWith({
        email,
        externalId,
        code,
      });
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toBeUndefined();
    });
  });

  it('Should handle error from confirmAccount', async () => {
    jest.spyOn(auth, 'confirmAccount').mockRejectedValue(CONFIRM_ACCOUNT_ERROR);

    const { getByPlaceholderText, getByTestId } = render(<ConfirmAccount />);

    const confirmationCodeInput = getByPlaceholderText('Confirmation code');
    fireEvent.changeText(confirmationCodeInput, '654321');

    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { children } = getByTestId('confirm-account-error');
      expect(children[0]).toEqual(CONFIRM_ACCOUNT_ERROR);
    });

    // check sentry
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
