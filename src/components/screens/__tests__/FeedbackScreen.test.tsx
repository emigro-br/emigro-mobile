import React from 'react';

import { fireEvent } from '@testing-library/react-native';

import { render } from 'test-utils';

import { FeedbackScreen } from '../FeedbackScreen';

describe('FeedbackScreen component', () => {
  const mockOnContinue = jest.fn();

  test('Should render component correctly', () => {
    const { getByText, getByTestId } = render(
      <FeedbackScreen title="Success" message="Congratulations!" onContinue={mockOnContinue} />,
    );

    const successIcon = getByTestId('success-icon');
    expect(successIcon).toBeOnTheScreen();

    const title = getByText('Success');
    expect(title).toBeOnTheScreen();

    const message = getByText('Congratulations!');
    expect(message).toBeOnTheScreen();

    const continueButton = getByTestId('action-button');
    expect(continueButton).toBeOnTheScreen();
    expect(continueButton).toHaveTextContent('Continue');
  });

  test('Should render error icon when action is error', () => {
    const { getByTestId } = render(
      <FeedbackScreen title="Error" message="Something went wrong" action="error" onContinue={mockOnContinue} />,
    );

    const errorIcon = getByTestId('error-icon');
    expect(errorIcon).toBeOnTheScreen();
  });

  test('Should render warning icon when action is waring', () => {
    const { getByTestId } = render(
      <FeedbackScreen title="Warning" message="Be careful" action="warning" onContinue={mockOnContinue} />,
    );

    const warningIcon = getByTestId('warning-icon');
    expect(warningIcon).toBeOnTheScreen();
  });

  test('Should render waiting icon when action is waiting', () => {
    const { getByTestId } = render(
      <FeedbackScreen title="Waiting" message="Please wait" action="waiting" onContinue={mockOnContinue} />,
    );

    const waitingIcon = getByTestId('waiting-icon');
    expect(waitingIcon).toBeOnTheScreen();
  });

  test('Should call onContinue when Continue button is pressed', () => {
    const { getByTestId } = render(
      <FeedbackScreen title="Success" message="Congratulations!" onContinue={mockOnContinue} />,
    );

    const continueButton = getByTestId('action-button');
    fireEvent.press(continueButton);

    expect(mockOnContinue).toHaveBeenCalled();
  });
});
