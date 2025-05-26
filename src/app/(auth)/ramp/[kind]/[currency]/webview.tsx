import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CustomWebView } from '@/components/CustomWebView';
import { Box } from '@/components/ui/box';
import { LoadingScreen } from '@/screens/Loading';

const Webview = () => {
  console.log('[Webview] ✅ Component rendered');

  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string }>();
  const insets = useSafeAreaInsets();

  console.log('[Webview] 🔍 Received params -> url:', url);

  if (!url) {
    console.log('[Webview] ❌ "url" is missing, returning <LoadingScreen />');
    return <LoadingScreen />;
  }

  const handleClose = () => {
    console.log('[Webview/handleClose] 🔴 Closing WebView...');
    router.dismiss();
  };

  return (
    <Box className="flex-1" style={{ paddingTop: insets.top }}>
      <CustomWebView
        url={decodeURIComponent(url)} // ✅ Ensure the URL is properly decoded
        onClose={handleClose}
        onLoadStart={() => console.log('[Webview] ⏳ WebView onLoadStart:', url)}
        onLoad={() => console.log('[Webview] ✅ WebView Loaded:', url)}
        onLoadProgress={({ nativeEvent }) => {
          console.log('[Webview] 🔄 WebView Progress:', nativeEvent.progress);
        }}
        onError={(syntheticEvent) => {
          console.error('[Webview] ❌ WebView Error:', syntheticEvent.nativeEvent);
        }}
        onHttpError={({ nativeEvent }) => {
          console.error('[Webview] ❌ WebView HTTP Error:', nativeEvent.statusCode, nativeEvent.description);
        }}
      />
    </Box>
  );
};

export default Webview;
