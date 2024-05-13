import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CryptoAsset } from '@/types/assets';

import { ManageAccounts } from '../manage';

describe('ManageAccounts', () => {
  const mockAccounts: CryptoAsset[] = [CryptoAsset.XLM, CryptoAsset.USDC];

  const mockOnAdd = jest.fn();
  const mockOnHide = jest.fn();

  beforeEach(() => {
    render(<ManageAccounts accounts={mockAccounts} onAdd={mockOnAdd} onHide={mockOnHide} />);
  });

  it('should render the accounts list', () => {
    const accountElements = screen.getAllByTestId('account-tile');
    expect(accountElements.length).toBe(mockAccounts.length);

    expect(screen.getByText('XLM')).toBeOnTheScreen();
    expect(screen.getByText('USDC')).toBeOnTheScreen();

    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBe(mockAccounts.length);

    const addButton = allButtons[0];
    expect(addButton).toBeOnTheScreen();
    expect(addButton).toHaveTextContent('add');
  });

  it('should call onAdd when add button is pressed', async () => {
    const addButton = screen.getAllByRole('button')[0];
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(mockAccounts[0]);
    });
  });

  // TODO: hide button not implemented yet
  it.skip('should call onHide when hide button is pressed', () => {
    const hideButton = screen.getAllByRole('button')[0];
    fireEvent.press(hideButton);
    expect(mockOnHide).toHaveBeenCalledWith(mockAccounts[0]);
  });
});
