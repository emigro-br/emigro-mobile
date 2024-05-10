import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AskCamera from '../ask-camera';

jest.mock('expo-camera/next', () => ({
  Camera: () => null,
  useCameraPermissions: () => [null, jest.fn()],
}));

describe('AskCamera component', () => {
  test('Should render AskCamera component correctly', () => {
    const { getByText, getByTestId } = render(<AskCamera onAnswer={jest.fn()} />);

    const icon = getByTestId('camera-icon');
    expect(icon).toBeDefined();

    const title = getByText('Enable Camera');
    expect(title).toBeDefined();

    const continueButton = getByText('Continue');
    expect(continueButton).toBeDefined();
  });

  test('Should call onAnswer with permission when Continue button is pressed', async () => {
    const mockOnAnswer = jest.fn();
    const { getByText } = render(<AskCamera onAnswer={mockOnAnswer} />);

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockOnAnswer).toHaveBeenCalled();
    });
  });
});
