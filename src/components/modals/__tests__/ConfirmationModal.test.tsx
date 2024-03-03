import React from 'react';
import { Text } from 'react-native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ConfirmationModal } from '../ConfirmationModal';

// FIXME: This test is not working because the modal is not being rendered
describe.skip('ConfirmationModal', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <ConfirmationModal title="Confirm the transaction" isOpen onPress={jest.fn()} onClose={jest.fn()}>
        <Text>Are you sure you want to withdraw?</Text>
      </ConfirmationModal>,
    );
    expect(getByTestId('confirmation-modal')).toBeOnTheScreen();
    expect(getByText('Confirm the transaction')).toBeOnTheScreen();
    expect(getByText('Are you sure you want to withdraw?')).toBeOnTheScreen();
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onPress when the Confirm button is pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ConfirmationModal title="Confirm the transaction" isOpen onPress={onPress} onClose={jest.fn()}>
        <Text>Are you sure you want to withdraw?</Text>
      </ConfirmationModal>,
    );
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(onPress).toHaveBeenCalled();
    });
  });

  it('calls onClose when the Cancel button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ConfirmationModal title="Confirm the transaction" isOpen onPress={jest.fn()} onClose={onClose}>
        <Text>Are you sure you want to withdraw?</Text>
      </ConfirmationModal>,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a loading modal when processing', async () => {
    const { getByText, getByTestId } = render(
      <ConfirmationModal title="Confirm the transaction" isOpen onPress={jest.fn()} onClose={jest.fn()}>
        <Text>Are you sure you want to withdraw?</Text>
      </ConfirmationModal>,
    );
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(getByTestId('loading-modal')).toBeOnTheScreen();
    });
  });
});
