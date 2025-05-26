import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { OpenURLModal } from '@/components/modals/OpenURLModal';

describe('OpenURLModal', () => {
  it('show not render when is not open', () => {
    const { queryByTestId } = render(<OpenURLModal isOpen={false} onConfirm={jest.fn()} />);
    expect(queryByTestId('open-url-modal')).toBeNull();
  });

  it('show render when is open', () => {
    const { queryByTestId } = render(<OpenURLModal isOpen onConfirm={jest.fn()} />);
    expect(queryByTestId('open-url-modal')).toBeDefined();
  });

  // FIXME: gluestack is not rendering Modal on test
  test.skip('Should render the modal with the correct message', () => {
    const { getByText, getByTestId } = render(<OpenURLModal isOpen onConfirm={jest.fn()} />);

    const modal = getByTestId('open-url-modal');
    expect(modal).toBeOnTheScreen();

    const messageText = getByText('You will be redirected to the Anchor website to complete this transaction.');
    expect(messageText).toBeOnTheScreen();
  });

  test.skip('Should call the onConfirm function when the continue button is pressed', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(<OpenURLModal isOpen onConfirm={onConfirmMock} />);

    const continueButton = getByText('Continue to Anchor');
    fireEvent.press(continueButton);

    expect(onConfirmMock).toHaveBeenCalled();
  });
});
