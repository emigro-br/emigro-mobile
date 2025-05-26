import { fireEvent, screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { PasswordInput } from '../PasswordInput';

describe('PasswordInput', () => {
  const mockProps = {
    value: '',
    showPassword: false,
    toggleShowPassword: jest.fn(),
    onChangeText: jest.fn(),
    error: undefined,
  };

  it('should render the password input component with correct props', async () => {
    render(<PasswordInput {...mockProps} />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toBeOnTheScreen();
    expect(passwordInput.props.value).toBe('');

    // const showPasswordButton = screen.getByLabelText('Show password');
    // expect(showPasswordButton).toBeOnTheScreen();
    // expect(showPasswordButton.props.onPress).toBe(mockProps.toggleShowPassword);
  });

  it.skip('should toggle show password when show password button is pressed', () => {
    render(<PasswordInput {...mockProps} />);

    const showPasswordButton = screen.getByAccessibilityHint('Show password');
    fireEvent.press(showPasswordButton);

    expect(mockProps.toggleShowPassword).toHaveBeenCalledTimes(1);
  });

  it('should call onChangeText when password input value changes', () => {
    render(<PasswordInput {...mockProps} />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.changeText(passwordInput, 'test123');

    expect(mockProps.onChangeText).toHaveBeenCalledTimes(1);
    expect(mockProps.onChangeText).toHaveBeenCalledWith('test123');
  });

  it('should render error message when error prop is provided', () => {
    const error = { type: 'validate', message: 'Invalid password' };
    render(<PasswordInput {...mockProps} error={error} />);

    const errorMessage = screen.getByText('Invalid password');
    expect(errorMessage).toBeOnTheScreen();
  });
});
