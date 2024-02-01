import { IBalance } from '@/types/IBalance';
import { BalanceStore } from '../BalanceStore';
import * as BalanceModule from '@/services/emigro';

jest.mock('@/services/emigro', () => ({
  getUserBalance: jest.fn(),
}));

describe('BalanceStore', () => {
  let balanceStore: BalanceStore;
  const mockBalances: IBalance[] = [{
    assetType: 'someAssetType',
    assetCode: 'someAssetCode',
    label: 'someLabel',
    value: 'someValue',
    balance: '100',
  }];

  beforeEach(() => {
    balanceStore = new BalanceStore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should set user balance', () => {
    balanceStore.setUserBalance(mockBalances);
    expect(balanceStore.userBalance).toEqual(mockBalances);
  });

  it('should fetch user balance', async () => {
    (BalanceModule.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);
    jest.spyOn(balanceStore, 'setUserBalance');

    await balanceStore.fetchUserBalance();

    expect(BalanceModule.getUserBalance).toHaveBeenCalled();
    expect(balanceStore.setUserBalance).toHaveBeenCalledWith(mockBalances);
  });

  it('should throw an error when fetching user balance fails', async () => {
    const consoleMock = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Failed to fetch user balance');
    (BalanceModule.getUserBalance as jest.Mock).mockRejectedValue(error);
    jest.spyOn(balanceStore, 'setUserBalance');

    await expect(balanceStore.fetchUserBalance()).rejects.toThrowError();

    expect(BalanceModule.getUserBalance).toHaveBeenCalled();
    expect(balanceStore.setUserBalance).not.toHaveBeenCalled();
    expect(consoleMock).toHaveBeenCalledWith(error);
  });

  it('should return user balance', () => {
    balanceStore.setUserBalance(mockBalances);
    expect(balanceStore.get('someAssetCode')).toBe(100);
  });
});
