import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { IAuthSession } from '@/types/IAuthSession';

import Login from '@screens/Login';

import * as auth from '@services/auth';

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

jest.mock('@services/emigro', () => ({
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

    expect(emailInput).toBeOnTheScreen();
    expect(passwordInput).toBeOnTheScreen();
    expect(signInButton).toBeOnTheScreen();
    expect(signInButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call signIn with correct credentials', async () => {
    const signInMock = jest.spyOn(auth, 'signIn');
    const authSession: IAuthSession = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      idToken: 'idToken',
      tokenExpirationDate: new Date(),
      email: '',
    };

    signInMock.mockResolvedValue(Promise.resolve(authSession));

    const { getByTestId } = render(<Login navigation={mockNavigattion} />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByTestId('signin-button');
    expect(signInButton).toHaveAccessibilityState({ disabled: false });

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(sessionStore.signIn).toHaveBeenCalledWith(authSession);
    });
  });
});
