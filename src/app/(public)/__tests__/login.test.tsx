import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { sessionStore } from '@/stores/SessionStore';

import Login from '../login';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    session: {},
    clear: jest.fn(),
    save: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock('@/services/emigro/users', () => ({
  getUserPublicKey: jest.fn(),
}));

describe('Login screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should render correctly', async () => {
    const { getByTestId } = render(<Login />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const signInButton = getByTestId('signin-button');
    const forgotPasswordLink = getByTestId('forgot-password-link');

    expect(emailInput).toBeOnTheScreen();
    expect(passwordInput).toBeOnTheScreen();
    expect(forgotPasswordLink).toBeOnTheScreen();
    expect(signInButton).toBeOnTheScreen();
    // expect(signInButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call signIn with correct credentials', async () => {
    const { getByTestId } = render(<Login />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');

    const email = 'test@example.com';
    const password = 'password123';
    const signInButton = getByTestId('signin-button');
    expect(signInButton).toHaveAccessibilityState({ disabled: true });

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, password);

    await waitFor(() => {
      expect(signInButton).toHaveAccessibilityState({ disabled: false });
    });

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(sessionStore.signIn).toHaveBeenCalledWith(email, password);
    });
  });

  test('Should show api error', async () => {
    const error = new Error('Custom API error');
    jest.spyOn(sessionStore, 'signIn').mockRejectedValueOnce(error);
    const { getByTestId, getByText } = render(<Login />);

    const email = 'test@test.com';
    const password = 'testpass';

    fireEvent.changeText(getByTestId('email'), email);
    fireEvent.changeText(getByTestId('password'), password);

    const signInButton = getByTestId('signin-button');
    await waitFor(() => {
      expect(signInButton).toHaveAccessibilityState({ disabled: false });
    });

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Custom API error')).toBeOnTheScreen();
    });
  });

  test('Should navigate to forgot password screen', async () => {
    const router = useRouter();
    const { getByTestId } = render(<Login />);

    const forgotPasswordLink = getByTestId('forgot-password-link');
    fireEvent.press(forgotPasswordLink);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/password-recovery');
    });
  });

  test('Should show form validation error messages', async () => {
    const { getByText, getByTestId } = render(<Login />);

    fireEvent.changeText(getByTestId('email'), 'invalid-email');
    fireEvent.changeText(getByTestId('password'), 'invalid');

    // submit form with ENTER
    fireEvent(getByTestId('password'), 'onSubmitEditing');

    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeOnTheScreen();
      expect(getByText('Password must be at least 8 characters')).toBeOnTheScreen();
    });

    // clear inputs
    fireEvent.changeText(getByTestId('email'), '');
    fireEvent.changeText(getByTestId('password'), '');

    await waitFor(() => {
      expect(getByText('Email is required')).toBeOnTheScreen();
      expect(getByText('Password is required')).toBeOnTheScreen();
    });
  });
});
