/*eslint quotes: ["error", "single", { "avoidEscape": true }]*/
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { render } from '@testing-library/react-native';

import { Provider } from '@components/Provider';

import RootNavigator from '@navigation/index';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-camera/next');
jest.mock('expo-clipboard');
jest.mock('mobx-react-lite');

describe('Landing component', () => {
  test('Should render Landing component correctly', () => {
    const { getByText } = render(
      <Provider>
        <NavigationContainer>
          <RootNavigator isSignedIn={false} />
        </NavigationContainer>
        ,
      </Provider>,
    );
    const welcomeScreen = getByText("The Traveler's Digital Wallet");

    expect(welcomeScreen).toBeDefined();
  });
});
