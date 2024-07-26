import { useLocalSearchParams, useRouter } from 'expo-router';

import { fireEvent, render, waitFor } from 'test-utils';

import * as anchors from '@/services/emigro/anchors';
import { CryptoAsset } from '@/types/assets';

import Webview from '../webview';

jest.mock('@/services/emigro/anchors', () => ({
  ...jest.requireActual('@/services/emigro/anchors'),
  depositUrl: jest.fn(),
  withdrawUrl: jest.fn(),
}));

describe('Webview', () => {
  const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ kind: 'deposit', asset: CryptoAsset.USDC });
  });

  it('should render LoadingScreen when url is null', () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const { getByTestId, queryByTestId } = render(<Webview />);
    expect(getByTestId('loading-screen')).toBeOnTheScreen();
    expect(queryByTestId('custom-webview')).toBeNull();
  });

  it('should render CustomWebView with correct props when url is not null', async () => {
    const router = useRouter();
    const mockUrl = 'https://example.com';
    const mockId = 'test-id';
    (anchors.depositUrl as jest.Mock).mockResolvedValueOnce({ url: mockUrl, id: mockId });

    const { getByTestId } = render(<Webview />);

    await waitFor(() => {
      expect(getByTestId('custom-webview')).toBeOnTheScreen();
    });

    expect(anchors.depositUrl).toHaveBeenCalledWith(
      { asset_code: CryptoAsset.USDC },
      anchors.CallbackType.EVENT_POST_MESSAGE,
    );
    expect(router.dismiss).not.toHaveBeenCalled();
    expect(router.setParams).not.toHaveBeenCalled();
  });

  it('should call router.dismiss and router.setParams when onClose is called with transactionId', async () => {
    const router = useRouter();
    const mockUrl = 'https://example.com';
    const mockId = 'test-id';
    (anchors.depositUrl as jest.Mock).mockResolvedValueOnce({ url: mockUrl, id: mockId });

    const { getByText } = render(<Webview />);

    await waitFor(() => {
      expect(getByText('Close')).toBeOnTheScreen();
    });

    const onClose = getByText('Close');
    fireEvent.press(onClose);

    expect(router.dismiss).toHaveBeenCalled();
    expect(router.setParams).toHaveBeenCalledWith({ latest: mockId });
  });

  it('should call withdrawUrl when kind is "withdraw"', async () => {
    const mockUrl = 'https://example.com';
    const mockId = 'test-id';
    (anchors.withdrawUrl as jest.Mock).mockResolvedValueOnce({ url: mockUrl, id: mockId });

    mockUseLocalSearchParams.mockReturnValue({ kind: 'withdraw', asset: CryptoAsset.EURC });

    const { getByTestId } = render(<Webview />);
    await waitFor(() => {
      expect(getByTestId('custom-webview')).toBeOnTheScreen();
    });

    expect(anchors.withdrawUrl).toHaveBeenCalledWith(
      { asset_code: CryptoAsset.EURC },
      anchors.CallbackType.EVENT_POST_MESSAGE,
    );
  });
});
