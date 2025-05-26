import React from 'react';
import { View } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { EmigroHeader } from '../Header';

describe('EmigroHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header component', () => {
    const { getByTestId } = render(<EmigroHeader />);
    const logo = getByTestId('emigro-logo');
    expect(logo).toBeOnTheScreen();
    expect(logo).toHaveAccessibilityValue('Emigro');
  });

  test('navigates to home screen when logo is pressed', () => {
    const router = useRouter();
    const { getByTestId } = render(<EmigroHeader />);
    const logo = getByTestId('emigro-logo');
    fireEvent.press(logo);
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  test('renders the header with actions', () => {
    const { getByTestId } = render(
      <EmigroHeader actions={[<View key="1">Action 1</View>, <View key="2">Action 2</View>]} />,
    );
    const actions = getByTestId('header-actions');
    expect(actions).toBeOnTheScreen();
    expect(actions.children).toHaveLength(2);
  });
});
