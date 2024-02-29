import { CryptoAsset } from '@/types/assets';

import { SwapBloc, SwapTransaction } from '../bloc';

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    session: { publicKey: 'mockedPublicKey' },
  },
}));

jest.mock('@services/emigro', () => ({
  sendTransaction: jest.fn().mockResolvedValue({ transactionHash: 'hash' }),
}));

describe('SwapBloc', () => {
  let swapBloc: SwapBloc;

  beforeEach(() => {
    swapBloc = new SwapBloc();
  });

  it('should call swap with correct parameters', async () => {
    const emigro = jest.requireMock('@/services/emigro');

    const transaction: SwapTransaction = {
      from: CryptoAsset.EURC,
      fromValue: 100,
      to: CryptoAsset.BRL,
      toValue: 120,
      rate: 1.2,
      fees: 0,
    };

    swapBloc.setTransaction(transaction);

    await swapBloc.swap();

    // check sendTransaction is called with correct parameters
    expect(emigro.sendTransaction).toHaveBeenCalledWith({
      maxAmountToSend: '100', // cry
      destinationAmount: '120',
      destination: 'mockedPublicKey',
      sourceAssetCode: CryptoAsset.EURC,
      destinationAssetCode: CryptoAsset.BRL,
    });
  });
});
