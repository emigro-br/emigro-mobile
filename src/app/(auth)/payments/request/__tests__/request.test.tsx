import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExpoRouter } from 'expo-router/types/expo-router';

import { RequestPayment } from '..';

describe('RequestPayment component', () => {
  let router: ExpoRouter.Router;

  beforeEach(() => {
    router = useRouter();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ asset: 'BRL' });
    render(<RequestPayment />);
  });

  it('Should render the component correctly', () => {
    const heading = screen.getByText('How much will you request?');
    expect(heading).toBeOnTheScreen();

    const assetInput = screen.getByTestId('asset-input');
    expect(assetInput).toBeOnTheScreen();

    const requestOpenAmountButton = screen.getByText('Request open amount');
    expect(requestOpenAmountButton).toBeOnTheScreen();

    const generateQRCodeButton = screen.getByTestId('generate-qr-code-button');
    expect(generateQRCodeButton).toBeOnTheScreen();
    expect(generateQRCodeButton).toHaveTextContent('Generate QR Code');
    expect(generateQRCodeButton).toHaveAccessibilityState({ disabled: true });
  });

  it('Should navigate to RequestWithQRCode screen when Generate QR Code button is pressed', () => {
    // fill input to enable button
    const assetInput = screen.getByTestId('asset-input');
    fireEvent.changeText(assetInput, '100'); // 1.00 BRL (mask put 2 decimal places)

    // button enabled
    const generateQRCodeButton = screen.getByTestId('generate-qr-code-button');
    expect(generateQRCodeButton).toHaveAccessibilityState({ disabled: false });

    fireEvent.press(generateQRCodeButton);

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/payments/request/show-qr-code',
      params: { asset: 'BRL', value: '1' },
    });
  });

  it('Should navigate to RequestWithQRCode screen when "Request open amount" is pressed', () => {
    const requestOpenAmountButton = screen.getByText('Request open amount');

    fireEvent.press(requestOpenAmountButton);

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/payments/request/show-qr-code',
      params: { asset: 'BRL', value: '0' },
    });
  });
});
