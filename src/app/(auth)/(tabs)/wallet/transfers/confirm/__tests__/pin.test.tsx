import React from 'react';

import { useToast } from '@gluestack-ui/themed';
import { waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import mockConsole from 'jest-mock-console';

import { inputPIN, render } from 'test-utils';

import { Transaction } from '@/services/emigro/types';
import { securityStore } from '@/stores/SecurityStore';
import { transferStore } from '@/stores/TransferStore';

import { ConfirmPin } from '../pin';

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

describe('ConfirmPin', () => {
  let router: any;

  beforeEach(() => {
    router = useRouter();
    jest.clearAllMocks();
  });

  test('Should render review transfer details', () => {
    const { getByText } = render(<ConfirmPin />);
    expect(getByText('Enter your PIN code')).toBeOnTheScreen();
  });

  test('Should call handlePress when Send button is pressed', async () => {
    const verifyPinSpy = jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);
    // mock pay function
    jest.spyOn(transferStore, 'transfer').mockResolvedValue({ status: 'paid' } as Transaction);

    render(<ConfirmPin />);

    inputPIN('1234');

    await waitFor(() => {
      expect(verifyPinSpy).toHaveBeenCalledWith('1234');
      expect(transferStore.transfer).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('./success');
    });
  });

  test('Should show error dialog when transaction fails', async () => {
    const restoreConsole = mockConsole();
    const verifyPinSpy = jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);

    // mock pay function
    (transferStore.transfer as jest.Mock).mockRejectedValue(new Error('Boom'));

    render(<ConfirmPin />);

    inputPIN('1234');

    await waitFor(() => {
      expect(verifyPinSpy).toHaveBeenCalledWith('1234');
      expect(transferStore.transfer).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith({
        pathname: './error',
        params: { error: 'Boom' },
      });
    });
    restoreConsole();
  });

  test('should close the screen when pin verification fails', async () => {
    const toast = useToast();
    jest.spyOn(securityStore, 'verifyPin').mockResolvedValue(false);

    const { getByText } = render(<ConfirmPin />);

    for (let i = 0; i < 3; i++) {
      inputPIN('1234');
      if (i < 2) {
        // the last try will show max attempts message
        await waitFor(() => {
          expect(getByText('PIN is incorrect')).toBeOnTheScreen();
        });
      }
    }

    await waitFor(() => {
      expect(router.dismiss).toHaveBeenCalled();
      expect(toast.show).toHaveBeenCalled();
    });
  });
});
