import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { IUserProfile } from '@/types/IUserProfile';

import Profile from '@screens/profile/Profile';

import { sessionStore } from '@stores/SessionStore';

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    clear: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
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
  useState: () => [jest.fn(), jest.fn()],
}));

describe('Profile screen', () => {
  test('Should trigger the Logout action and clear the storage', async () => {
    const { getByText } = render(<Profile />);
    const logoutButton = getByText('Log out');

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(sessionStore.clear).toHaveBeenCalled();
    });
  });
});
