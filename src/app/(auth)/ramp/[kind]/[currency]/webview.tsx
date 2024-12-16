import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { CustomWebView } from '@/components/CustomWebView';
import { Box } from '@/components/ui/box';
import { LoadingScreen } from '@/screens/Loading';
import {
  CallbackType,
  OperationKind,
  depositUrl,
  withdrawUrl,
} from '@/services/emigro/anchors';
import { CryptoAsset } from '@/types/assets';

const Webview = () => {
  console.log('[Webview] Component rendered');

  const router = useRouter();
  const { kind, asset } = useLocalSearchParams<{ kind: string; asset: CryptoAsset }>();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  console.log('[Webview] Received params -> kind:', kind, 'asset:', asset);

  useEffect(() => {
    console.log('[Webview/useEffect] Attempting to fetch deposit/withdraw URL');

    const fetchUrl = async () => {
      if (!kind || !asset) {
        console.debug('[Webview/fetchUrl] Missing "kind" or "asset" param');
        return;
      }

      const anchorParams = {
        asset_code: asset,
      };

      console.debug('[Webview/fetchUrl] anchorParams:', anchorParams);

      const getUrlFn = kind === OperationKind.DEPOSIT ? depositUrl : withdrawUrl;
      console.debug(
        '[Webview/fetchUrl] Selected function:',
        getUrlFn === depositUrl ? 'depositUrl' : 'withdrawUrl'
      );

      try {
        const { url: nextUrl, id } = await getUrlFn(
          anchorParams,
          CallbackType.EVENT_POST_MESSAGE
        );
        console.debug('[Webview/fetchUrl] nextUrl:', nextUrl, 'transactionId:', id);

        setUrl(nextUrl);
        setTransactionId(id);
      } catch (err) {
        console.error('[Webview/fetchUrl] Error fetching deposit/withdraw URL:', err);
      }
    };

    fetchUrl();
  }, [kind, asset]);

  console.log('[Webview] Current state -> url:', url, 'transactionId:', transactionId);

  if (!url) {
    console.log('[Webview] "url" not set, returning <LoadingScreen />');
    return <LoadingScreen />;
  }

  const handleClose = () => {
    console.log('[Webview/handleClose] Closing webview, transactionId:', transactionId);
    router.dismiss();
    if (transactionId) {
      console.log('[Webview/handleClose] Updating route params with latest:', transactionId);
      router.setParams({ latest: transactionId });
    }
  };

  return (
    <Box className="flex-1" style={{ paddingTop: insets.top }}>
      <CustomWebView
        url={url}
        onClose={handleClose}
        // Pass event handlers for debugging:
        onLoadStart={() => console.log('[Webview] WebView onLoadStart:', url)}
        onLoad={() => console.log('[Webview] WebView onLoad:', url)}
        onLoadProgress={({ nativeEvent }) => {
          console.log('[Webview] WebView onLoadProgress:', nativeEvent.progress);
        }}
        onError={(syntheticEvent) => {
          console.error('[Webview] WebView onError:', syntheticEvent.nativeEvent);
        }}
        onHttpError={({ nativeEvent }) => {
          console.error('[Webview] WebView onHttpError:', nativeEvent.statusCode, nativeEvent.description);
        }}
      />
    </Box>
  );
};

export default Webview;
