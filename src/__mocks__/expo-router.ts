import { ExpoRouter } from 'expo-router/types/expo-router';

const routerMock = {
  back: jest.fn(),
  canGoBack: jest.fn(),
  push: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  canDismiss: jest.fn(),
  setParams: jest.fn(),
};

export const useRouter = (): ExpoRouter.Router => routerMock;

export const useLocalSearchParams = jest.fn().mockImplementation(() => ({}));

export const useFocusEffect = jest.fn();

const stackMock = {
  Screen: jest.fn(),
  Navigator: jest.fn(),
};

export const Stack = stackMock;
