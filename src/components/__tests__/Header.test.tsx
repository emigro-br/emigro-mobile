import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import Header from '@components/Header';
import { clearSession } from '@/storage/helpers';

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
}));

jest.mock('@/storage/helpers', () => ({
  clearSession: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Header component', () => {
  test('Should trigger the Logout action and clear AsyncStorage', async () => {
    const { getByText } = render(<Header />);
    const logoutButton = getByText('Logout');

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(clearSession).toHaveBeenCalled();
    });
  });
});
