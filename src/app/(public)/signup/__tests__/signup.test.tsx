import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import * as auth from '@/services/emigro/auth';
import { Role, User } from '@/services/emigro/types';

import CreateAccount from '..';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-keyboard-aware-scroll-view');

jest.mock('@/services/emigro/auth', () => ({
  signUp: jest.fn(),
}));

describe('CreateAccount component', () => {
  const validPassword = '1Abcdef?';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should render correctly', async () => {
    const { getByTestId } = render(<CreateAccount />);

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
    // expect(createButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call signUp with correct information', async () => {
    const router = useRouter();
    const email = 'test@example.com';
    const externalId = 'example_external_id';
    const signUpMock = jest.spyOn(auth, 'signUp');
    const mockResponse: User = {
      id: 'uid',
      externalId,
      publicKey: 'public_key_value',
      secretKey: 'secret_key_value',
      role: Role.CUSTOMER,
      status: 'active',
      createdAt: '2022-01-01',
      updatedAt: '2022-01-01',
      preferences: {},
    };

    signUpMock.mockResolvedValue(mockResponse);

    const { getByTestId } = render(<CreateAccount />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const firstNameInput = getByTestId('firstName');
    const lastNameInput = getByTestId('lastName');

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, validPassword);
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');

    const createButton = getByTestId('create-button');
    expect(createButton).toHaveAccessibilityState({ disabled: false });

    fireEvent.press(createButton);

    const expectedCall = {
      email,
      password: validPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    };

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(expectedCall);
      expect(router.push).toHaveBeenCalledWith({ pathname: '/signup/confirm', params: { email, externalId } });
    });
  });

  test('Should display an error message if signUp fails', async () => {
    const error = new Error('Fake API error');
    jest.spyOn(auth, 'signUp').mockRejectedValue(error);
    const { getByTestId, findByText } = render(<CreateAccount />);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const firstNameInput = getByTestId('firstName');
    const lastNameInput = getByTestId('lastName');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, validPassword);

    const createButton = getByTestId('create-button');
    fireEvent.press(createButton);

    await waitFor(() => {
      const errorElement = findByText('Fake API error');
      expect(errorElement).toBeTruthy();
    });
  });

  test('Should show form validation error messages', async () => {
    const { getByText, getByTestId, getAllByText } = render(<CreateAccount />);
    fireEvent.press(getByTestId('create-button'));

    await waitFor(() => {
      expect(getAllByText('This is required')).toHaveLength(2);
      expect(getByText('Email is required')).toBeOnTheScreen();
      expect(getByText('Password is required')).toBeOnTheScreen();
    });
  });
});
