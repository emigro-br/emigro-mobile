import React from 'react';
import { View } from 'react-native';

import { fireEvent } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CircularButton } from '../CircularButton';

describe('CircularButton component', () => {
  const mockLabel = 'Button Label';
  const mockIcon = () => <View testID="mock-icon" />;
  const mockOnPress = jest.fn();

  it('renders the button correctly with label and icon', () => {
    const { getByText, getByTestId } = render(
      <CircularButton label={mockLabel} icon={mockIcon} onPress={mockOnPress} />,
    );

    expect(getByText(mockLabel)).toBeOnTheScreen();
    expect(getByTestId('mock-icon')).toBeOnTheScreen();
  });

  it('calls the onPress function when the button is pressed', () => {
    const { getByRole } = render(<CircularButton label={mockLabel} icon={mockIcon} onPress={mockOnPress} />);

    fireEvent.press(getByRole('button'));

    expect(mockOnPress).toHaveBeenCalled();
  });
});
