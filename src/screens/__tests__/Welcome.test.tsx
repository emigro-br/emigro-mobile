import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import CreateAccount from '@screens/welcome/CreateAccount';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

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
  test('Should navigates to Login when "Log In" is pressed', () => {
    const { getByText } = render(<TestNavigator />);

    const logInButton = getByText('Access your account');
    fireEvent.press(logInButton);

    const loginText = getByText('Sign in');
    expect(loginText).toBeOnTheScreen();
  });

  test('Should navigates to CreateAccount when "Sign Up" is pressed', () => {
    const { getByText } = render(<TestNavigator />);

    const signUpButton = getByText('Create an Account');
    fireEvent.press(signUpButton);

    const createAccountText = getByText('Sign Up');
    expect(createAccountText).toBeOnTheScreen();
  });
});
