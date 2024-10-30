import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { securityStore } from '@/stores/SecurityStore';

import { ConfigurePIN } from '../configure-pin';

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    savePin: jest.fn(),
  },
}));

describe('ConfigurePIN component', () => {
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    router = useRouter();
    render(<ConfigurePIN />);
  });

  it('Should render the PIN input correctly', () => {
    const inputFields = screen.getAllByLabelText('Input Field');
    expect(inputFields).toHaveLength(4);
  });

  it('Should display the correct title based on isReEnter state', async () => {
    const enterTitle = screen.getByText('Enter your new PIN code');
    expect(enterTitle).toBeOnTheScreen();

    fillWithPIN(screen, '1234');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Next');
    fireEvent.press(submitButton);

    await waitFor(() => {
      const reEnterTitle = screen.getByText('Re-enter your PIN code');
      expect(reEnterTitle).toBeOnTheScreen();
    });
    expect(submitButton).toHaveTextContent('Confirm PIN');
  });

  it('Should navigate to the next screen when PINs match', async () => {
    const submitButton = screen.getByTestId('submit-button');

    // set the first PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Re-enter your PIN code')).toBeOnTheScreen();
    });

    // set the second PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    // check success
    await waitFor(() => {
      expect(securityStore.savePin).toHaveBeenCalledWith('1234');
      expect(router.back).toHaveBeenCalled();
    });
  });

  it('Should clear the PIN input when PINs do not match', async () => {
    const submitButton = screen.getByTestId('submit-button');

    // set the first PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Re-enter your PIN code')).toBeOnTheScreen();
    });

    // set the second PIN (wrong PIN)
    fillWithPIN(screen, '5678');
    fireEvent.press(submitButton);

    // check failure
    await waitFor(() => {
      const error = screen.getByText('PINs do not match');
      expect(error).toBeOnTheScreen();
    });

    const enterTitle = screen.getByText('Enter your new PIN code');
    expect(enterTitle).toBeOnTheScreen();

    expect(securityStore.savePin).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });
});

// TODO: use inputPIN from test-utils
const fillWithPIN = (screen: any, pin: string) => {
  const inputFields = screen.getAllByLabelText('Input Field');

  for (let i = 0; i < 4; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }
  return inputFields;
};
