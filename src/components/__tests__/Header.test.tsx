import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import Header from '../Header';

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header component', () => {
    const { getByTestId } = render(<Header />);
    const logo = getByTestId('logo');
    expect(logo).toBeOnTheScreen();
    expect(logo).toHaveAccessibilityValue('Emigro');
  });

  test('navigates to home screen when logo is pressed', () => {
    const router = useRouter();
    const { getByTestId } = render(<Header />);
    const logo = getByTestId('logo');
    fireEvent.press(logo);
    expect(router.navigate).toHaveBeenCalledWith('/');
  });
});
