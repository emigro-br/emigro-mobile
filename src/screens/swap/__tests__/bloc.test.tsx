import { AssetCode } from '@constants/assetCode';

import { SwapBloc, SwapTransaction } from '../bloc';

jest.mock('@/storage/helpers', () => ({
  getSession: jest.fn().mockResolvedValue({ publicKey: 'mockedPublicKey' }),
}));

jest.mock('@/services/emigro', () => ({
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
      from: AssetCode.EURC,
      fromValue: 100,
      to: AssetCode.BRL,
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
      sourceAssetCode: AssetCode.EURC,
      destinationAssetCode: AssetCode.BRL,
    });
  });
});
