import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { PIN } from '../PIN';

describe('PIN component', () => {
  const onPinSuccess = jest.fn();
  const onPinFail = jest.fn();
  const verifyPin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    render(<PIN verifyPin={verifyPin} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
  });

  it('Should render the PIN component correctly', () => {
    const heading = screen.getByText('Enter your PIN code');
    expect(heading).toBeOnTheScreen();

    const button = screen.getByTestId('submit-button');
    expect(button).toBeOnTheScreen();
    expect(button).toHaveTextContent('Submit');
    expect(button).toHaveAccessibilityState({ disabled: true });
  });

  it('Should render the PIN component correctly with custom labels', () => {
    const title = 'Re-Enter your PIN code';
    const btnLabel = 'Submit PIN';
    render(<PIN title={title} btnLabel={btnLabel} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
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
    const verifyPin = jest.fn().mockImplementation(() => {
      throw new Error('Invalid PIN');
    });
    render(<PIN verifyPin={verifyPin} onPinSuccess={onPinSuccess} onPinFail={onPinFail} />);
    fillWithPIN(screen, '1234');
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);
    await waitFor(() => {
      expect(onPinFail).toHaveBeenCalled();
    });
    expect(screen.getByText('Invalid PIN')).toBeOnTheScreen();
  });
});

const fillWithPIN = (screen: any, pin: string) => {
  const inputFields = screen.getAllByLabelText('Input Field');

  for (let i = 0; i < 4; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }
  return inputFields;
};
