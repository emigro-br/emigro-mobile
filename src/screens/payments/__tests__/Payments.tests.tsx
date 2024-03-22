import { fireEvent, render, screen } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { Payments } from '../Payments';

describe('Payments component', () => {
  const navigation: any = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    render(<Payments navigation={navigation} />);
  });

  it('Should render correctly', () => {
    const scanButton = screen.getByText('Scan a Payment');
    const requestButton = screen.getByText('Request with a QR Code');
    expect(scanButton).toBeOnTheScreen();
    expect(requestButton).toBeOnTheScreen();
  });

  it('Should open the scanner when Scan a Payment button is pressed', () => {
    const scanButton = screen.getByText('Scan a Payment');
    fireEvent.press(scanButton);
    expect(navigation.push).toHaveBeenCalledWith('PayWithQRCode');
  });

  it('Should open the asset list action sheet when Request with a QR Code button is pressed', () => {
    const requestButton = screen.getByText('Request with a QR Code');
    fireEvent.press(requestButton);
    expect(screen.getByTestId('asset-list-action-sheet')).toBeOnTheScreen();
  });

  it.skip('Should close the asset list action sheet when an asset is selected', () => {
    const requestButton = screen.getByText('Request with a QR Code');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.BRL);
    fireEvent.press(assetItem);
    expect(screen.queryByTestId('asset-list-action-sheet')).toBeNull();
  });

  it.skip('Should navigate to RequestPayment screen when an asset is selected', () => {
    const requestButton = screen.getByText('Request with a QR Code');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.BRL);
    fireEvent.press(assetItem);
    expect(navigation.push).toHaveBeenCalledWith('RequestPayment', { asset: CryptoAsset.BRL });
  });
});
