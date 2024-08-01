import { render } from 'test-utils';

import { UserProfile } from '@/services/emigro/types';
import { sessionStore } from '@/stores/SessionStore';

import PersonalInfo from '../personal-info';

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    clear: jest.fn(),
    publicKey: 'test-public',
    get profile() {
      return null;
    },
  },
}));

const profileMock = {
  given_name: 'Test Name',
  family_name: 'Test Last Name',
  email: 'test@email.com',
  address: 'Test Address',
} as UserProfile;

describe('PersonalInfo screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should appear loading screen while fetching the user information', () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue(null);
    const { getByTestId } = render(<PersonalInfo />);

    expect(getByTestId('loading-spinner')).toBeOnTheScreen();
  });

  test('Should render the Profile screen correctly', () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue(profileMock);
    const screen = render(<PersonalInfo />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
