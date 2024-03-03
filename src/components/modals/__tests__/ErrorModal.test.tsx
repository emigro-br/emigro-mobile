import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { ErrorModal } from '../ErrorModal';

describe.skip('ErrorModal', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <ErrorModal title="Transaction Failed" isOpen onClose={jest.fn()} errorMessage="Test error message" />,
    );
    expect(getByTestId('error-modal')).toBeOnTheScreen();
    expect(getByText('Transaction Failed')).toBeOnTheScreen();
    expect(getByText('Test error message')).toBeOnTheScreen();
  });

  it('calls onClose when the Close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ErrorModal title="Transaction Failed" isOpen onClose={onClose} errorMessage="Test error message" />,
    );
    fireEvent.press(getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
