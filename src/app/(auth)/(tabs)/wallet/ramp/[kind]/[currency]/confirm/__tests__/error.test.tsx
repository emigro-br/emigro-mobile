import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { fireEvent, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import WithdrawalError from '../error';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

describe('WithdrawalError', () => {
  it('should render the error message correctly', () => {
    render(<WithdrawalError />);

    const title = screen.getByText('Failed to confirm transaction');
    expect(title).toBeOnTheScreen();

    const button = screen.getByText('Got it');
    expect(button).toBeOnTheScreen();
  });

  it('should call router.dismiss when the button is pressed', () => {
    const router = useRouter();
    render(<WithdrawalError />);

    const button = screen.getByText('Got it');
    fireEvent.press(button);

    expect(router.dismiss).toHaveBeenCalled();
  });
});
