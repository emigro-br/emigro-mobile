import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { render } from 'test-utils';

import { OnboardingStack } from '../OnboardingStack';

describe('OnboardingStack', () => {
  it('should render BankCurrencyScreen as initial route', () => {
    const { getByText } = render(
      <NavigationContainer>
        <OnboardingStack />
      </NavigationContainer>,
    );
    const text = getByText('Choose your main currency');
    expect(text).toBeOnTheScreen();
  });
});
