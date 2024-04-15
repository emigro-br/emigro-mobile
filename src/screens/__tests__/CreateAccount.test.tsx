import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

import { CreateAccount } from '@screens/signup/CreateAccount';

import * as auth from '@services/auth';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

const mockNavigattion: any = {
  navigate: jest.fn(),
  push: jest.fn(),
};

jest.mock('@services/auth', () => ({
  signUp: jest.fn(),
}));

describe('CreateAccount component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should render correctly', async () => {
    const { getByTestId } = render(<CreateAccount navigation={mockNavigattion} />);

    const firstNameInput = getByTestId('firstName');
    const lastNameInput = getByTestId('lastName');
    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const createButton = getByTestId('create-button');

    expect(firstNameInput).toBeOnTheScreen();
    expect(lastNameInput).toBeOnTheScreen();
    expect(emailInput).toBeOnTheScreen();
    expect(passwordInput).toBeOnTheScreen();
    expect(createButton).toBeOnTheScreen();
    expect(createButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call signUp with correct information', async () => {
    const email = 'test@example.com';
    const username = 'example_username';
    const signUpMock = jest.spyOn(auth, 'signUp');
    const mockResponse = {
      id: 1,
      username,
      publicKey: 'public_key_value',
      secretKey: 'secret_key_value',
      role: 'CUSTOMER',
      status: 'active',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-01',
    };

    signUpMock.mockResolvedValue(mockResponse);

    const { getByTestId } = render(<CreateAccount navigation={mockNavigattion} />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const firstNameInput = getByTestId('firstName');
    const lastNameInput = getByTestId('lastName');

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');

    const createButton = getByTestId('create-button');
    expect(createButton).toHaveAccessibilityState({ disabled: false });

    fireEvent.press(createButton);

    const expectedCall = {
      email,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    };

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(expectedCall);
      expect(mockNavigattion.push).toHaveBeenCalledWith('ConfirmAccount', {
        email,
        username,
      });
    });
  });

  test('Should display an error message if signUp fails', async () => {
    const error = new Error(SIGNUP_ERROR_MESSAGE);
    jest.spyOn(auth, 'signUp').mockRejectedValue(error);
    const { getByTestId, findByText } = render(<CreateAccount navigation={mockNavigattion} />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const firstNameInput = getByTestId('firstName');
    const lastNameInput = getByTestId('lastName');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const createButton = getByTestId('create-button');
    fireEvent.press(createButton);

    await waitFor(() => {
      const errorElement = findByText(SIGNUP_ERROR_MESSAGE);
      expect(errorElement).toBeTruthy();
    });
  });
});
