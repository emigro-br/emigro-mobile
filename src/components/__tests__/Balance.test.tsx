import { render, screen } from '@testing-library/react-native';

import { userBalance } from '../../__mocks__/mock-balance';
import Balance from '../Balance';

describe('Balance component', () => {
  it('Should render the balance component correctly', () => {
    render(<Balance userBalance={userBalance} />);
    const balanceElement = screen.getByText('Accounts');

    expect(balanceElement).toBeTruthy();
  });

  it('Should display the correct asset codes and balances', () => {
    render(<Balance userBalance={userBalance} />);
    const brlAsset = screen.getByText('Brazilian Real');
    const usdcAsset = screen.getByText('USD Coin');
    const eurocAsset = screen.getByText('Euro Coin');
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
});
