import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { PinScreen } from '../PinScreen';

describe('PinScreen', () => {
  const onPinSuccess = jest.fn();
  const onPinFail = jest.fn();
  const verifyPin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    render(<PinScreen verifyPin={verifyPin} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
  });

  it('Should render the PIN correctly', () => {
    const heading = screen.getByText('Enter your PIN code');
    expect(heading).toBeOnTheScreen();

    const inputFields = screen.getAllByLabelText('Input Field');
    expect(inputFields).toHaveLength(4);

    const button = screen.getByTestId('submit-button');
    expect(button).toBeOnTheScreen();
    expect(button).toHaveTextContent('Submit');
    expect(button).toHaveAccessibilityState({ disabled: true });
  });

  it('Should render the PIN correctly with custom size', () => {
    const customSize = 6;
    render(<PinScreen verifyPin={verifyPin} onPinSuccess={onPinSuccess} onPinFail={onPinFail} pinSize={customSize} />);
    const heading = screen.getByText('Enter your PIN code');
    expect(heading).toBeOnTheScreen();

    const inputFields = screen.getAllByLabelText('Input Field');
    expect(inputFields).toHaveLength(customSize);
  });

  it('Should render the PIN correctly with custom labels', () => {
    const title = 'Re-Enter your PIN code';
    const btnLabel = 'Submit PIN';
    render(<PinScreen tagline={title} btnLabel={btnLabel} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
    const heading = screen.getByText(title);
    expect(heading).toBeOnTheScreen();

    const button = screen.getByText(btnLabel);
    expect(button).toBeOnTheScreen();
  });

  it('Should update the PIN when input fields are changed and enable the button', () => {
    const inputFields = fillWithPIN(screen, '1234');
    expect(inputFields[0].props.value).toBe('1');
    expect(inputFields[1].props.value).toBe('2');
    expect(inputFields[2].props.value).toBe('3');
    expect(inputFields[3].props.value).toBe('4');
    expect(screen.getByTestId('submit-button')).toHaveAccessibilityState({ disabled: false });
  });

  it('Should call onPinSuccess when the submit button is pressed with a valid PIN', async () => {
    verifyPin.mockResolvedValue(true);
    fillWithPIN(screen, '1234');
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);
    expect(verifyPin).toHaveBeenCalledWith('1234');

    await waitFor(() => {
      expect(onPinSuccess).toHaveBeenCalled();
    });
  });

  it('Should call onPinFail when throw error on submit', async () => {
    const error = new Error('Boom');
    const verifyPin = jest.fn().mockImplementation(() => {
      throw error;
    });
    render(<PinScreen verifyPin={verifyPin} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
    fillWithPIN(screen, '1234');
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);
    await waitFor(() => {
      expect(onPinFail).toHaveBeenCalledWith(error);
    });
  });

  it('Should call onPinFail when the PIN is incorrect', async () => {
    verifyPin.mockResolvedValue(false);
    fillWithPIN(screen, '1234');
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);
    expect(verifyPin).toHaveBeenCalledWith('1234');

    await waitFor(() => {
      expect(screen.getByText('PIN is incorrect')).toBeOnTheScreen();
    });
  });
});

const fillWithPIN = (screen: any, pin: string) => {
  const inputFields = screen.getAllByLabelText('Input Field');

  for (let i = 0; i < 4; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }
  return inputFields;
};
