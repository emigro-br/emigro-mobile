import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import Header from '@components/Header';

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Header component', () => {
  test('Should trigger the Logout action and clear AsyncStorage', () => {
    const { getByText } = render(<Header />);
    const logoutButton = getByText('Logout');

    fireEvent.press(logoutButton);

    expect(AsyncStorage.clear).toHaveBeenCalled();
  });
});
