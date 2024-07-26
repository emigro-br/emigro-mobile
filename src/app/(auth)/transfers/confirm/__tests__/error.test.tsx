import { fireEvent, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import PaymentError from '../error';

describe('PaymentError', () => {
  it('should render the error message correctly', () => {
    render(<PaymentError />);
    const title = screen.getByText('Transaction Failed');
    expect(title).toBeOnTheScreen();
    const button = screen.getByText('Understood');
    expect(button).toBeOnTheScreen();
  });

  it('should call dismiss when the button is pressed', () => {
    const router = useRouter();
    render(<PaymentError />);
    const button = screen.getByText('Understood');
    fireEvent.press(button);
    expect(router.dismissAll).toHaveBeenCalled();
  });
});
