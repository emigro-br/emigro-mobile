import { fireEvent, screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { userBalance } from '../../__mocks__/mock-balance';
import { WalletBalances } from '../WalletBalances';

describe('WalletBalances component', () => {
  const mockNavigation: any = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render the balance component correctly', () => {
    render(<WalletBalances userBalance={userBalance} navigation={mockNavigation} />);
    const balanceElement = screen.getByText('Accounts');
    expect(balanceElement).toBeOnTheScreen();

    expect(screen.getByTestId('add-button')).toBeOnTheScreen();

    const disclaimerElement = screen.getByText('All values are in equivalent stablecoin currency');
    expect(disclaimerElement).toBeOnTheScreen();
  });

  it('Should display the correct asset codes and balances', () => {
    render(<WalletBalances userBalance={userBalance} navigation={mockNavigation} />);
    const brlAsset = screen.getByText('Brazilian Real');
    const usdcAsset = screen.getByText('US Dollar');
    const eurocAsset = screen.getByText('Euro');
    const brlBalance = screen.getByText('R$ 10.00');
    const usdcBalance = screen.getByText('$ 30.00');
    const euroBalance = screen.getByText('€ 0.00');

    expect(brlAsset).toBeOnTheScreen();
    expect(usdcAsset).toBeOnTheScreen();
    expect(eurocAsset).toBeOnTheScreen();
    expect(brlBalance).toBeOnTheScreen();
    expect(usdcBalance).toBeOnTheScreen();
    expect(euroBalance).toBeOnTheScreen();
  });

  it('Should go to manage accounts when press add button', () => {
    render(<WalletBalances userBalance={userBalance} navigation={mockNavigation} />);
    const addButton = screen.getByTestId('add-button');

    fireEvent.press(addButton);

    expect(mockNavigation.push).toHaveBeenCalledWith('ManageAccounts');
  });
});
