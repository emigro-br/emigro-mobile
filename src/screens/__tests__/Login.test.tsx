import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import Login from '@screens/Login';

import { sessionStore } from '@stores/SessionStore';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    session: {},
    clear: jest.fn(),
    save: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock('@services/emigro/users', () => ({
  getUserPublicKey: jest.fn(),
}));

const mockNavigattion: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

describe('Login screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should render correctly', async () => {
    const { getByTestId } = render(<Login navigation={mockNavigattion} />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const signInButton = getByTestId('signin-button');
    const forgotPasswordLink = getByTestId('forgot-password-link');

    expect(emailInput).toBeOnTheScreen();
    expect(passwordInput).toBeOnTheScreen();
    expect(forgotPasswordLink).toBeOnTheScreen();
    expect(signInButton).toBeOnTheScreen();
    expect(signInButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call signIn with correct credentials', async () => {
    const { getByTestId } = render(<Login navigation={mockNavigattion} />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');

    const email = 'test@example.com';
    const password = 'password123';
    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, password);

    const signInButton = getByTestId('signin-button');
    expect(signInButton).toHaveAccessibilityState({ disabled: false });

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(sessionStore.signIn).toHaveBeenCalledWith(email, password);
    });
  });
});
