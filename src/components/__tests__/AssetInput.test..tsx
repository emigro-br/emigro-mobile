import { fireEvent, render, screen } from '@testing-library/react-native';

import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { AssetInput } from '../AssetInput';

describe('AssetInput component', () => {
  it('Should render placeholder correctly for crypto with value zero', () => {
    render(<AssetInput asset={CryptoAsset.USDC} value={0} onChangeValue={() => {}} />);
    const placeholder = screen.getByPlaceholderText('0 USDC');
    expect(placeholder).toBeTruthy();

    const inputValue = screen.queryByDisplayValue('0.00 USDC');
    expect(inputValue).toBeNull();
  });

  it('Should render placeholder correctly for currency with value zero', () => {
    render(<AssetInput asset={FiatCurrency.USD} value={0} onChangeValue={() => {}} />);
    const placeholder = screen.getByPlaceholderText('$ 0');
    expect(placeholder).toBeTruthy();

    const inputValue = screen.queryByDisplayValue('$ 0.00');
    expect(inputValue).toBeNull();
  });

  it('Should call onChangeValue when input value changes', () => {
    const onChangeValueMock = jest.fn();
    render(<AssetInput asset={CryptoAsset.USDC} value={0} onChangeValue={onChangeValueMock} precision={2} />);
    const inputElement = screen.getByPlaceholderText('0 USDC');

    fireEvent.changeText(inputElement, '1000');

    expect(onChangeValueMock).toHaveBeenCalledWith(10);
  });

  it('Should render the correct prefix and suffix for asset with same name of currency', () => {
    const value = 1;
    render(<AssetInput asset={CryptoAsset.BRL} value={value} onChangeValue={() => {}} />);
    const inputElement = screen.getByDisplayValue('R$ 1.00'); // not be: R$ 1.00 BRL
    expect(inputElement).toBeTruthy();
  });

  it('Should render the correct prefix and suffix for crypto asset', () => {
    const value = 1;
    render(<AssetInput asset={CryptoAsset.USDC} value={value} onChangeValue={() => {}} />);
    const inputElement = screen.getByDisplayValue('1.00 USDC');

    expect(inputElement).toBeTruthy();
  });

  it('Should render the correct prefix and suffix for fiat currency', () => {
    const value = 2;
    render(<AssetInput asset={FiatCurrency.USD} value={value} onChangeValue={() => {}} />);
    const inputElement = screen.getByDisplayValue('$ 2.00');

    expect(inputElement).toBeTruthy();
  });
});
