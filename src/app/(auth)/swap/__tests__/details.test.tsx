import { fireEvent, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { Transaction } from '@/services/emigro/types';
import { securityStore } from '@/stores/SecurityStore';
import { SwapTransaction, swapStore } from '@/stores/SwapStore';
import { CryptoAsset } from '@/types/assets';

import { DetailsSwap } from '../review';

jest.mock('@/services/emigro/users', () => ({
  getUserPublicKey: jest.fn().mockReturnValue('mockedPublicKey'),
}));

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

describe('DetailsSwap', () => {
  const transaction: SwapTransaction = {
    fromAsset: CryptoAsset.EURC,
    fromValue: 100,
    toAsset: CryptoAsset.BRL,
    toValue: 120,
    rate: 1.2,
  };

  // Create a separate component
  const DetailsSwapScreen = () => <DetailsSwap />;

  beforeAll(() => {
    jest.useFakeTimers();
    swapStore.setSwap(transaction);
    jest.spyOn(swapStore, 'swap').mockResolvedValue({ status: 'paid' } as Transaction);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getAllByText } = render(<DetailsSwapScreen />);

    expect(getByText('Review your swap')).toBeOnTheScreen();

    // from
    expect(getByText('Amount')).toBeOnTheScreen();
    expect(getByText('100.00 EURC')).toBeOnTheScreen();

    // rate
    expect(getByText('Rate')).toBeOnTheScreen();
    expect(getByText('1 BRL ≈ 1.200000 EURC')).toBeOnTheScreen();

    // to: rate is 1.2, so 100 EURC = 120 BRL
    expect(getByText('Exchanged')).toBeOnTheScreen();
    expect(getAllByText('120.00 BRL')).toHaveLength(2); // 2 because we have the rate and the final value (no fees)

    // fees
    // expect(getByText('Fees')).toBeOnTheScreen();
    // expect(getByText('0.01')).toBeOnTheScreen();

    // fees is 0.01, so 100 EURC = 120 BRL - 0.01 = 119.99 BRL
    expect(getByText('Final receive')).toBeOnTheScreen();
    // expect(getByText('119.99 BRL')).toBeOnTheScreen();

    expect(getByText('The final amount is estimated and may change.')).toBeOnTheScreen();
    expect(getByText('Swap EURC for BRL')).toBeOnTheScreen();
  });

  it('show PIN on button press and swap when confirm', async () => {
    const verifyPinSpy = jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);
    const { getByText } = render(<DetailsSwapScreen />);

    fireEvent.press(getByText('Swap EURC for BRL'));

    inputPIN('1234');

    expect(verifyPinSpy).toHaveBeenCalledWith('1234');

    await waitFor(() => {
      // expect(getByText('Processing...')).toBeOnTheScreen();
      expect(swapStore.swap).toHaveBeenCalled();
    });
  });

  it('shows error message', async () => {
    jest.spyOn(securityStore, 'verifyPin').mockResolvedValueOnce(true);
    jest.spyOn(swapStore, 'swap').mockRejectedValueOnce(new Error('error message'));

    const { getByText, getByTestId } = render(<DetailsSwapScreen />);

    fireEvent.press(getByText('Swap EURC for BRL'));

    inputPIN('1234');

    await waitFor(() => {
      //FIXME: the error-modal testID is aways rendering
      expect(getByTestId('error-modal')).toBeOnTheScreen();
    });
  });
});
