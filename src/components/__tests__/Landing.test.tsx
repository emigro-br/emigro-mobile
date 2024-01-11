import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';

import RootNavigator from '@navigation/index';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Landing component', () => {
  test('Should render Landing component correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );
    const welcomeScreen = getByText('The Travelers Digital Wallet');

    expect(welcomeScreen).toBeDefined();
  });
});
