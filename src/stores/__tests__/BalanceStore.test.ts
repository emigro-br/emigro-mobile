import { IBalance } from '@/types/IBalance';

import * as emigroApi from '@services/emigro';

import { BalanceStore } from '../BalanceStore';

jest.mock('@services/emigro', () => ({
  getUserBalance: jest.fn(),
}));

describe('BalanceStore', () => {
  let balanceStore: BalanceStore;
  const mockBalances: IBalance[] = [
    {
      assetType: 'someAssetType',
      assetCode: 'someAssetCode',
      label: 'someLabel',
      value: 'someValue',
      balance: '100',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
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
    (emigroApi.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);
    jest.spyOn(balanceStore, 'setUserBalance');

    await balanceStore.fetchUserBalance();

    expect(emigroApi.getUserBalance).toHaveBeenCalledTimes(1);
    expect(balanceStore.setUserBalance).toHaveBeenCalledWith(mockBalances);
  });

  it('should not call api twice on fetch user balance in short period', async () => {
    (emigroApi.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);
    jest.spyOn(balanceStore, 'setUserBalance');

    // call 2x
    await balanceStore.fetchUserBalance();
    await balanceStore.fetchUserBalance();

    expect(emigroApi.getUserBalance).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when fetching user balance fails', async () => {
    const message = 'Failed to fetch user balance';
    const error = new Error(message);
    (emigroApi.getUserBalance as jest.Mock).mockRejectedValue(error);
    jest.spyOn(balanceStore, 'setUserBalance');

    await expect(balanceStore.fetchUserBalance()).rejects.toThrowError();

    expect(emigroApi.getUserBalance).toHaveBeenCalled();
    expect(balanceStore.setUserBalance).not.toHaveBeenCalled();
  });

  it('should return user balance', () => {
    balanceStore.setUserBalance(mockBalances);
    expect(balanceStore.get('someAssetCode')).toBe(100);
  });

  it('should find the balance by asset code', () => {
    const balanceStore = new BalanceStore();
    const mockBalances: IBalance[] = [
      {
        assetType: 'someAssetType',
        assetCode: 'someAssetCode',
        label: 'someLabel',
        value: 'someValue',
        balance: '100',
      },
    ];
    balanceStore.setUserBalance(mockBalances);

    const foundBalance = balanceStore.find('someAssetCode');

    expect(foundBalance).toEqual(mockBalances[0]);
  });

  it('should return undefined when balance is not found', () => {
    const balanceStore = new BalanceStore();
    const mockBalances: IBalance[] = [
      {
        assetType: 'someAssetType',
        assetCode: 'someAssetCode',
        label: 'someLabel',
        value: 'someValue',
        balance: '100',
      },
    ];
    balanceStore.setUserBalance(mockBalances);

    const foundBalance = balanceStore.find('nonExistingAssetCode');

    expect(foundBalance).toBeUndefined();
  });
});
