import { Keyboard } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.spyOn(Keyboard, 'dismiss');

jest.mock('@/components/ui/toast', () => ({
  ...jest.requireActual('@/components/ui/toast'),
  useToast: jest.fn().mockReturnValue({ show: jest.fn() }),
}));
