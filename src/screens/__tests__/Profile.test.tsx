import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import Profile from '@screens/Profile';
import { clearSession } from '@/storage/helpers';
import { IUserProfile } from '@/types/IUserProfile';

jest.mock('@/storage/helpers', () => ({
  getSession: jest.fn(),
  clearSession: jest.fn(),
  getAccessToken: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@/services/emigro', () => ({
  getUserProfile: jest.fn().mockResolvedValue({
    given_name: 'Test Name',
    family_name: 'Test Last Name',
    email: 'test@email.com',
    address: 'Test Address',
  } as IUserProfile),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: () => ([
    jest.fn(),
    jest.fn(),
  ]),
}));

describe('Profile screen', () => {
  test('Should trigger the Logout action and clear the storage', async () => {
    const { getByText } = render(<Profile />);
    const logoutButton = getByText('Log out');

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalled();
    });
  });
});
