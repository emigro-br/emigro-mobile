import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { CustomWebView } from '@/components/CustomWebView';
import { LoadingScreen } from '@/components/screens/Loading';
import { Box } from '@/components/ui/box';
import { CallbackType, OperationKind, depositUrl, withdrawUrl } from '@/services/emigro/anchors';
import { CryptoAsset } from '@/types/assets';

const Webview = () => {
  const router = useRouter();
  const { kind, asset } = useLocalSearchParams<{ kind: string; asset: CryptoAsset }>();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUrl = async () => {
      if (!kind || !asset) {
        console.debug('Missing kind or asset');
        return;
      }

      const anchorParams = {
        asset_code: asset,
      };
      const getUrlFn = kind === OperationKind.DEPOSIT ? depositUrl : withdrawUrl;
      const { url, id } = await getUrlFn(anchorParams, CallbackType.EVENT_POST_MESSAGE);
      console.debug('Transaction id:', id);
      setUrl(url);
      setTransactionId(id);
    };
    fetchUrl();
  }, [kind, asset]);

  if (!url) {
    return <LoadingScreen />;
  }

  const hancleClose = () => {
    router.dismiss();
    if (transactionId) {
      router.setParams({ latest: transactionId });
    }
  };

  return (
    <Box className="flex-1" style={{ paddingTop: insets.top }}>
      <CustomWebView url={url} onClose={hancleClose} />
    </Box>
  );
};

export default Webview;
