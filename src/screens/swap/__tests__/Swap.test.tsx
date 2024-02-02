import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Swap } from '../Swap';
import { AssetCode } from '@constants/assetCode';
import * as emigroService from '@/services/emigro';

jest.mock('@/services/emigro', () => ({
  handleQuote: jest.fn().mockResolvedValue('1.0829'),
}));


describe('Swap component', () => {
  
  test('Should render Swap component correctly', async () => {

    const { getByText, getByTestId } = render(<Swap />);

    // check title
    const sellText = getByText(`Sell ${AssetCode.EURC}`);
    expect(sellText).toBeDefined();
    
    // check arrow icon
    const arrowIcon = getByTestId('arrowIcon');
    expect(arrowIcon).toBeDefined();
    
    await waitFor(() => {
      expect(emigroService.handleQuote).toBeCalledTimes(1);
      // check rate
      const buyText = getByText(`1 ${AssetCode.EURC} ≈ 1.0829 ${AssetCode.BRL}`);
      expect(buyText).toBeDefined();
    });
  });

  test('Should update sellValue and buyValue when onChangeValue is called', async () => {
    const { findAllByPlaceholderText } = render(<Swap />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');

    fireEvent.changeText(sellInput, '10');

    expect(sellInput.props.value).toBe('10');
    expect(buyInput.props.value).toBe('10.83');
  });
});
