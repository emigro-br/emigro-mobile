import React from 'react';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { render } from 'test-utils';
import { fireEvent } from '@testing-library/react-native';
import { SuccessScreen } from '../SuccessScreen';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

describe('SuccessScreen component', () => {
  const mockOnContinue = jest.fn();

  test('Should render SuccessScreen component correctly', () => {
    const { getByText, getByTestId } = render(
      <SuccessScreen title="Success" message="Congratulations!" onContinue={mockOnContinue} />,
    );

    const title = getByText('Success');
    expect(title).toBeOnTheScreen();

    const message = getByText('Congratulations!');
    expect(message).toBeOnTheScreen();

    const continueButton = getByTestId('action-button');
    expect(continueButton).toBeOnTheScreen();
    expect(continueButton).toHaveTextContent('Continue');
  });

  test('Should call onContinue when Continue button is pressed', () => {
    const { getByTestId } = render(
      <SuccessScreen title="Success" message="Congratulations!" onContinue={mockOnContinue} />,
    );

    const continueButton = getByTestId('action-button');
    fireEvent.press(continueButton);

    expect(mockOnContinue).toHaveBeenCalled();
  });
});
