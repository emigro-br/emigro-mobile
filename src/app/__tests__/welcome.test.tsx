import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { Welcome } from '@/app/(public)/welcome';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Welcome screen', () => {
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    router = useRouter();
  });

  test('Should render the Welcome screen correctly', () => {
    const { getByText } = render(<Welcome />);

    const welcomeText = getByText('Instant cross-border payments');
    expect(welcomeText).toBeOnTheScreen();

    const loginButton = getByText('Login');
    expect(loginButton).toBeOnTheScreen();

    const signUpButton = getByText('Create an Account');
    expect(signUpButton).toBeOnTheScreen();
  });

  test('Should navigates to Login when "Log In" is pressed', () => {
    const { getByText } = render(<Welcome />);

    const logInButton = getByText('Login');
    fireEvent.press(logInButton);

    expect(router.push).toHaveBeenCalledWith('/login');
  });

  test('Should navigates to CreateAccount when "Sign Up" is pressed', () => {
    const { getByText } = render(<Welcome />);

    const signUpButton = getByText('Create an Account');
    fireEvent.press(signUpButton);

    expect(router.push).toHaveBeenCalledWith('/signup');
  });
});
