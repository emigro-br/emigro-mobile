import { Text } from "@/components/ui/text";

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { SuccessModal } from '../SuccessModal';

describe.skip('SuccessModal', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <SuccessModal title="Transaction success!" isOpen onClose={jest.fn()}>
        <Text>Modal content</Text>
      </SuccessModal>,
    );
    expect(getByTestId('success-modal')).toBeOnTheScreen();
    expect(getByText('Transaction successful!')).toBeOnTheScreen();
    expect(getByText('Modal content')).toBeOnTheScreen();
  });

  it('calls onClose when the Close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(<SuccessModal title="Transaction success!" isOpen onClose={onClose} />);
    fireEvent.press(getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
