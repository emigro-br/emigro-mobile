import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { OpenURLModal } from '@screens/operation/modals/OpenURLModal';

describe('OpenURLModal', () => {
  test('Should render the modal with the correct message', () => {
    const { getByText } = render(<OpenURLModal isVisible onConfirm={jest.fn()} />);

    const messageText = getByText('You will be redirected to the Anchor website to complete this transaction.');

    expect(messageText).toBeTruthy();
  });

  test('Should call the onConfirm function when the continue button is pressed', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(<OpenURLModal isVisible onConfirm={onConfirmMock} />);

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    expect(onConfirmMock).toHaveBeenCalled();
  });
});
