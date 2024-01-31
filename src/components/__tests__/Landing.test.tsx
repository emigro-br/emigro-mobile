import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-camera/next');
jest.mock('expo-clipboard');

import RootNavigator from '@navigation/index';


describe('Landing component', () => {
  test('Should render Landing component correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator isSignedIn={false} />
      </NavigationContainer>,
    );
    const welcomeScreen = getByText('The Travelers Digital Wallet');

    expect(welcomeScreen).toBeDefined();
  });
});
