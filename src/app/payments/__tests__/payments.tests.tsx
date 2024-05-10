import { fireEvent, screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CryptoAsset } from '@/types/assets';

import { Payments } from '..';

jest.mock('@/hooks/feature-flags', () => ({
  useFeatureFlags: () => () => true,
}));

describe('Payments component', () => {
  const navigation: any = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    render(<Payments navigation={navigation} />);
  });

  it('Should render correctly', () => {
    const scanButton = screen.getByText('Scan to Pay');
    const requestButton = screen.getByText('Request Payment');
    expect(scanButton).toBeOnTheScreen();
    expect(requestButton).toBeOnTheScreen();
  });

  it('Should open the scanner when Scan a Payment button is pressed', () => {
    const scanButton = screen.getByText('Scan to Pay');
    fireEvent.press(scanButton);
    expect(navigation.push).toHaveBeenCalledWith('PayWithQRCode');
  });

  it('Should open the asset list action sheet when Request with a QR Code button is pressed', () => {
    const requestButton = screen.getByText('Request Payment');
    fireEvent.press(requestButton);
    expect(screen.getByTestId('asset-list-action-sheet')).toBeOnTheScreen();
  });

  it.skip('Should close the asset list action sheet when an asset is selected', () => {
    const requestButton = screen.getByText('Request Payment');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.BRL);
    fireEvent.press(assetItem);
    expect(screen.queryByTestId('asset-list-action-sheet')).toBeNull();
  });

  it.skip('Should navigate to RequestPayment screen when an asset is selected', () => {
    const requestButton = screen.getByText('Request Payment');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.BRL);
    fireEvent.press(assetItem);
    expect(navigation.push).toHaveBeenCalledWith('RequestPayment', { asset: CryptoAsset.BRL });
  });

  it('Should open the Pix Copia & Cola screen when Pix Copia & Cola button is pressed', () => {
    const pixButton = screen.getByText('Pix Copia & Cola');
    fireEvent.press(pixButton);
    expect(navigation.push).toHaveBeenCalledWith('PastePixCode');
  });
});
