import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { IAuthSession } from '@/types/IAuthSession';

import { Provider } from '@components/Provider';

import Login from '@screens/Login';

import * as auth from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    session: {},
    clear: jest.fn(),
    save: jest.fn(),
    fetchPublicKey: jest.fn(),
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

    const { getByTestId } = render(
      <Provider>
        <Login navigation={mockNavigattion} />
      </Provider>,
    );

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByTestId('signin-button');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(sessionStore.save).toHaveBeenCalledWith(authSession);
      expect(sessionStore.fetchPublicKey).toHaveBeenCalled();
    });
  });
});
