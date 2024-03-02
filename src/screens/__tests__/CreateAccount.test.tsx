import { fireEvent, render, waitFor } from '@testing-library/react-native';
import mockConsole from 'jest-mock-console';

import { Provider } from '@components/Provider';

import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

import CreateAccount from '@screens/welcome/CreateAccount';

import * as auth from '@services/auth';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('CreateAccount component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should call signUp with correct information', async () => {
    const signUpMock = jest.spyOn(auth, 'signUp');
    const mockResponse = {
      id: 1,
      username: 'example_username',
      publicKey: 'public_key_value',
      secretKey: 'secret_key_value',
      role: 'CUSTOMER',
      status: 'active',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-01',
    };

    signUpMock.mockResolvedValue(mockResponse);

    const { getByPlaceholderText, getByText } = render(
      <Provider>
        <CreateAccount navigation={{}} />
      </Provider>,
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const addressInput = getByPlaceholderText('Address');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(addressInput, '123 Main St');

    fireEvent.press(getByText('Sign up'));

    const signUpBodyMock = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      role: 'CUSTOMER',
    };

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(signUpBodyMock);
    });
  });

  test('Should display an error message if signUp fails', async () => {
    const restoreConsole = mockConsole();
    const error = new Error();
    jest.spyOn(auth, 'signUp').mockRejectedValue(error);
    const { getByPlaceholderText, getByText, findByText } = render(<CreateAccount navigation={{}} />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const addressInput = getByPlaceholderText('Address');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, '');
    fireEvent.changeText(addressInput, '');

    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      const errorElement = findByText(SIGNUP_ERROR_MESSAGE);
      expect(errorElement).toBeTruthy();
      expect(console.error).toHaveBeenCalledWith(error);
    });
    restoreConsole();
  });
});
