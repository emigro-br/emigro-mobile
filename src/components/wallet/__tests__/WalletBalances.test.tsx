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
    render(<WalletBalances userBalance={userBalance} />);
    const brlAsset = screen.getByText('Brazilian Real');
    const brlBalance = screen.getByText('R$ 10.00');
    expect(brlAsset).toBeOnTheScreen();
    expect(brlBalance).toBeOnTheScreen();

    const usdcAsset = screen.getByText('USD Coin');
    const usdcBalance = screen.getByText('$ 30.00');
    expect(usdcAsset).toBeOnTheScreen();
    expect(usdcBalance).toBeOnTheScreen();

    const eurocAsset = screen.getByText('EURo Coin');
    const euroBalance = screen.getByText('€ 0.00');
    expect(eurocAsset).toBeOnTheScreen();
    expect(euroBalance).toBeOnTheScreen();
  });

  it('Should go to manage accounts when press add button', () => {
    const mockNavigation = useRouter();
    render(<WalletBalances userBalance={userBalance} />);
    const addButton = screen.getByTestId('add-button');

    fireEvent.press(addButton);

    expect(mockNavigation.push).toHaveBeenCalledWith('/wallet/manage');
  });
});
