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
    const brlAssetCodeElement = screen.getByText('BRL');
    const usdcAssetCodeElement = screen.getByText('USD');
    const balanceElement = screen.getByText('10');
    const noFundsElement = screen.getByText('No funds');

    expect(brlAssetCodeElement).toBeTruthy();
    expect(usdcAssetCodeElement).toBeTruthy();
    expect(balanceElement).toBeTruthy();
    expect(noFundsElement).toBeTruthy();
  });
});
