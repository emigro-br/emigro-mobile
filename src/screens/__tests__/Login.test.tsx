import { fireEvent, render, waitFor } from '@testing-library/react-native';

import * as cognito from '@/services/cognito';

import Login from '@screens/welcome/Login';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Login screen', () => {
  test('Should call signIn with correct credentials', async () => {
    const signInMock = jest.spyOn(cognito, 'signIn');
    signInMock.mockResolvedValue(Promise.resolve());

    const { getByPlaceholderText, getByText } = render(<Login />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    fireEvent.press(getByText('Log in'));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
