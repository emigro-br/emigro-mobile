import { fireEvent, screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { ConfigurePIN } from '../ConfigurePIN';

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

  it('Should display the correct title based on isReEnter state', () => {
    const enterTitle = screen.getByText('Enter your PIN code');
    expect(enterTitle).toBeOnTheScreen();

    fillWithPIN(screen, '1234');

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    const reEnterTitle = screen.getByText('Re-enter your PIN code');
    expect(reEnterTitle).toBeOnTheScreen();
  });

  it('Should navigate to the next screen when PINs match', () => {
    const submitButton = screen.getByTestId('submit-button');

    // set the first PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    // set the second PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    // check success
    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });

  it('Should clear the PIN input when PINs do not match', () => {
    const submitButton = screen.getByTestId('submit-button');

    // set the first PIN
    fillWithPIN(screen, '1234');
    fireEvent.press(submitButton);

    // set the second PIN (wrong PIN)
    fillWithPIN(screen, '5678');
    fireEvent.press(submitButton);

    // check failure
    expect(mockNavigation.popToTop).not.toHaveBeenCalled();
    const enterTitle = screen.getByText('Enter your PIN code');
    expect(enterTitle).toBeOnTheScreen();
  });
});

const fillWithPIN = (screen: any, pin: string) => {
  const inputFields = screen.getAllByLabelText('Input Field');

  for (let i = 0; i < 4; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }
  return inputFields;
};
