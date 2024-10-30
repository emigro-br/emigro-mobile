import { fireEvent, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { CryptoAsset } from '@/types/assets';

import { Payments } from '..';

describe('Payments component', () => {
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    router = useRouter();
    render(<Payments />);
  });

  it('Should render correctly', () => {
    // const scanButton = screen.getByText('Scan to Pay');
    // const requestButton = screen.getByText('Request Payment');
    // expect(scanButton).toBeOnTheScreen();
    // expect(requestButton).toBeOnTheScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('Should open the scanner when Scan a Payment button is pressed', () => {
    const scanButton = screen.getByTestId('scan-to-pay');
    fireEvent.press(scanButton);
    expect(router.push).toHaveBeenCalledWith('/payments/scan');
  });

  it('Should open the asset list action sheet when Request with a QR Code button is pressed', () => {
    const requestButton = screen.getByTestId('request-payment');
    fireEvent.press(requestButton);
    expect(screen.getByTestId('asset-list-action-sheet')).toBeOnTheScreen();
  });

  it.skip('Should close the asset list action sheet when an asset is selected', () => {
    const requestButton = screen.getByTestId('request-payment');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.USDC);
    fireEvent.press(assetItem);
    expect(screen.queryByTestId('asset-list-action-sheet')).toBeNull();
  });

  it.skip('Should navigate to RequestPayment screen when an asset is selected', () => {
    const requestButton = screen.getByTestId('request-payment');
    fireEvent.press(requestButton);
    const assetItem = screen.getByText(CryptoAsset.USDC);
    fireEvent.press(assetItem);
    expect(router.push).toHaveBeenCalledWith('RequestPayment', { asset: CryptoAsset.USDC });
  });

  it('Should open the Pix Copia & Cola screen when Pix Copia & Cola button is pressed', () => {
    const pixButton = screen.getByTestId('pix-copia-e-cola');
    fireEvent.press(pixButton);
    expect(router.push).toHaveBeenCalledWith('/payments/pix/copia-e-cola');
  });
});
