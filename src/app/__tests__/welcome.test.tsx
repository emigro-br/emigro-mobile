import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { fireEvent } from '@testing-library/react-native';

import { render } from 'test-utils';

import Login from '@/app/signin';
import { CreateAccount } from '@/app/signup';
import { Welcome } from '@/app/welcome';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

const Stack = createNativeStackNavigator();
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={CreateAccount} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Welcome screen', () => {
  test('Should render the Welcome screen correctly', () => {
    const { getByText } = render(<TestNavigator />);

    const welcomeText = getByText('Instant cross-border payments');
    expect(welcomeText).toBeOnTheScreen();

    const loginButton = getByText('Login');
    expect(loginButton).toBeOnTheScreen();

    const signUpButton = getByText('Create an Account');
    expect(signUpButton).toBeOnTheScreen();
  });

  test('Should navigates to Login when "Log In" is pressed', () => {
    const { getByText } = render(<TestNavigator />);

    const logInButton = getByText('Login');
    fireEvent.press(logInButton);

    const loginText = getByText('Sign in');
    expect(loginText).toBeOnTheScreen();
  });

  test('Should navigates to CreateAccount when "Sign Up" is pressed', () => {
    const { getByText } = render(<TestNavigator />);

    const signUpButton = getByText('Create an Account');
    fireEvent.press(signUpButton);

    const createAccountText = getByText('Sign up to Emigro');
    expect(createAccountText).toBeOnTheScreen();
  });
});
