import { fireEvent, render } from '@testing-library/react-native';

import Button from '../Button';

describe('Button', () => {
  it('renders the title when no children are provided', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders the children when provided', () => {
    const { getByText } = render(<Button title="Test Button">Hello World</Button>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows a loading indicator and hide text when loading', () => {
    const { getByTestId, queryByText } = render(<Button title="Test Button" loading />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });
});
