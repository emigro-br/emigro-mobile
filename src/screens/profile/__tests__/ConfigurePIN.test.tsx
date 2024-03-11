import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { sessionStore } from '@stores/SessionStore';

import { ConfigurePIN } from '../ConfigurePIN';

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    savePin: jest.fn(),
  },
}));

describe('ConfigurePIN component', () => {
  const mockNavigation: any = {
    popToTop: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    render(<ConfigurePIN navigation={mockNavigation} />);
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
    fireEvent.press(submitButton);

    await waitFor(() => {
      const reEnterTitle = screen.getByText('Re-enter your PIN code');
      expect(reEnterTitle).toBeOnTheScreen();
    });
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
      expect(sessionStore.savePin).toHaveBeenCalledWith('1234');
      expect(mockNavigation.popToTop).toHaveBeenCalled();
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
      const error = screen.getByText('Invalid PIN');
      expect(error).toBeOnTheScreen();
    });

    const enterTitle = screen.getByText('Enter your new PIN code');
    expect(enterTitle).toBeOnTheScreen();

    expect(sessionStore.savePin).not.toHaveBeenCalled();
    expect(mockNavigation.popToTop).not.toHaveBeenCalled();
  });
});

const fillWithPIN = (screen: any, pin: string) => {
  const inputFields = screen.getAllByLabelText('Input Field');

  for (let i = 0; i < 4; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }
  return inputFields;
};
