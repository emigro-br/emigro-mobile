import { fireEvent, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { userBalance } from '@/mocks/mock-balance';

import { WalletBalances } from '../WalletBalances';

describe('WalletBalances component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render the balance component correctly', () => {
    render(<WalletBalances userBalance={userBalance} />);
    const balanceElement = screen.getByText('Accounts');
    expect(balanceElement).toBeOnTheScreen();

    expect(screen.getByTestId('add-button')).toBeOnTheScreen();
  });

  it('Should display the correct asset codes and balances', () => {
    const customBalances = [
      ...userBalance,
      { balance: '2', assetType: 'credit_alphanum4', assetCode: 'ANY', priceUSD: 0.1 },
      { balance: '1', assetType: 'credit_alphanum4', assetCode: 'EURO', priceUSD: 0.1, deprecated: true },
    ];
    render(<WalletBalances userBalance={customBalances} />);
    const brlAsset = screen.getByText('Brazilian Digital Token');
    const brlBalance = screen.getByText('R$ 10.00');
    expect(brlAsset).toBeOnTheScreen();
    expect(brlBalance).toBeOnTheScreen();

    const usdcAsset = screen.getByText('USD Coin');
    const usdcBalance = screen.getByText('$ 30.00');
    expect(usdcAsset).toBeOnTheScreen();
    expect(usdcBalance).toBeOnTheScreen();

    const eurocAsset = screen.getByText('Euro Coin');
    const euroBalance = screen.getByText('€ 0.00');
    expect(eurocAsset).toBeOnTheScreen();
    expect(euroBalance).toBeOnTheScreen();

    const unknownAsset = screen.queryByText('ANY');
    expect(unknownAsset).not.toBeOnTheScreen();

    const deprecatedAsset = screen.queryByText('EURO');
    expect(deprecatedAsset).not.toBeOnTheScreen();
  });

  it('Should not display the balances values when hiding', () => {
    const { queryByText, queryAllByText } = render(<WalletBalances userBalance={userBalance} hide />);
    expect(queryByText('Brazilian Digital Token')).toBeOnTheScreen();
    expect(queryByText('R$ 10.00')).not.toBeOnTheScreen();

    expect(queryByText('USD Coin')).toBeOnTheScreen();
    expect(queryByText('$ 30.00')).not.toBeOnTheScreen();

    expect(queryByText('Euro Coin')).toBeOnTheScreen();
    expect(queryByText('€ 0.00')).not.toBeOnTheScreen();

    // Should display **** instead of the balance
    expect(queryAllByText('****')).toHaveLength(userBalance.length);
  });

  it('Should go to manage accounts when press add button', () => {
    const mockNavigation = useRouter();
    render(<WalletBalances userBalance={userBalance} />);
    const addButton = screen.getByTestId('add-button');

    fireEvent.press(addButton);

    expect(mockNavigation.push).toHaveBeenCalledWith('/wallet/manage');
  });
});
