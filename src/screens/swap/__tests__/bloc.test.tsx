import { AssetCode } from '@constants/assetCode';
import { SwapBloc, SwapTransaction } from '../bloc';
import * as emigro from '@/services/emigro';


jest.mock('@/services/emigro', () => ({
  getUserPublicKey: jest.fn().mockResolvedValue('mockedPublicKey'),
  sendTransaction: jest.fn().mockResolvedValue({ transactionHash: 'hash' }),
}));


describe('SwapBloc', () => {
  let swapBloc: SwapBloc;

  beforeEach(() => {
    swapBloc = new SwapBloc();
  });

  it('should call swap with correct parameters', () => {
    const transaction: SwapTransaction = {
      from: AssetCode.EURC, fromValue: 100, to: AssetCode.BRL, toValue: 120,
    };

    swapBloc.swap(transaction);

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
