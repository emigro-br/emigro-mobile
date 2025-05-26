import { fireEvent, render, screen } from '@testing-library/react-native';

import { FieldError, TextInput } from '../TextInput';

describe('TextInput component', () => {
  const label = 'Username';
  const value = 'JohnDoe';
  const onChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render the label correctly', () => {
    render(<TextInput label={label} value={value} onChangeText={onChangeText} />);
    const labelElement = screen.getByText(label);
    expect(labelElement).toBeOnTheScreen();
  });

  it('Should render the input value correctly', () => {
    render(<TextInput label={label} value={value} onChangeText={onChangeText} />);
    const inputElement = screen.getByDisplayValue(value);
    expect(inputElement).toBeOnTheScreen();
  });

  it('Should call the onChange function when input value changes', () => {
    render(<TextInput label={label} value={value} onChangeText={onChangeText} />);
    const inputElement = screen.getByDisplayValue(value);
    fireEvent.changeText(inputElement, 'JaneDoe');
    expect(onChangeText).toHaveBeenCalledWith('JaneDoe');
  });

  it('Should render the error message correctly', () => {
    const error: FieldError = {
      type: 'required',
      message: 'Username is required',
    };
    render(<TextInput label={label} value={value} onChangeText={onChangeText} error={error} />);
    const errorElement = screen.getByText(error.message!);
    expect(errorElement).toBeOnTheScreen();
  });
});
