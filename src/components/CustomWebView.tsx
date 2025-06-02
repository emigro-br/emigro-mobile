import React, { useEffect, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';

type Props = {
  url: string;
  onMessage?: (event: WebViewMessageEvent) => void;
  onClose?: () => void;
};

export const CustomWebView = ({ url, onMessage, onClose }: Props) => {
  console.log('[CustomWebView] Rendering with URL:', url);

  const webviewRef = useRef<WebView | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      console.log('[CustomWebView] Opening in-app browser for iOS:', url);
      WebBrowser.openBrowserAsync(url)
        .then(() => {
          console.log('[CustomWebView] In-app browser closed');
        })
        .catch((err) => {
          console.error('[CustomWebView] WebBrowser error:', err);
        })
        .finally(() => {
          onClose?.();
        });
    }
  }, [url]);

  const injectedJavaScript = `
    (function() {
      var originalPostMessage = window.postMessage;
      var patchedPostMessage = function(message, targetOrigin, transfer) {
        window.ReactNativeWebView.postMessage(message);
      };
      window.postMessage = patchedPostMessage;
    })();
    true;
  `;

  const handleClose = () => {
    console.log('[CustomWebView] handleClose triggered');
    webviewRef.current?.stopLoading();
    onClose?.();
  };

  const handleLoadStart = (navState: WebViewNavigation) => {
    console.log('[CustomWebView] onLoadStart ->', navState.url);
  };

  const handleLoadProgress = (event: any) => {
    console.log('[CustomWebView] onLoadProgress ->', event.nativeEvent.progress);
  };

  const handleLoadEnd = (navState: WebViewNavigation) => {
    console.log('[CustomWebView] onLoadEnd ->', navState.url);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[CustomWebView] onError ->', nativeEvent);
  };

  const handleHttpError = (evt: any) => {
    const { statusCode, description } = evt.nativeEvent;
    console.error('[CustomWebView] onHttpError ->', statusCode, description);
  };

  const customUserAgent =
    Platform.OS === 'android'
      ? 'Mozilla/5.0 (Linux; Android 10; KadoRNApp) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Mobile Safari/537.36'
      : 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile Safari/605.1.15';

  // Don't render WebView on iOS because we're using the in-app browser
  if (Platform.OS === 'ios') return null;

  return (
    <Box className="flex-1">
      <HStack className="px-2">
        <Button onPress={handleClose} variant="link">
          <ButtonText>Close</ButtonText>
        </Button>
      </HStack>

      <WebView
        ref={webviewRef}
        style={styles.container}
        source={{ uri: url }}
        testID="custom-webview"
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        mixedContentMode="always"
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        useWebKit={true}
        setSupportMultipleWindows={false}
        userAgent={customUserAgent}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={handleLoadStart}
        onLoadProgress={handleLoadProgress}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onShouldStartLoadWithRequest={(event) => {
          console.log('[CustomWebView] Should start ->', event.url);
          return true;
        }}
        onMessage={(event) => {
          console.log('[CustomWebView] onMessage:', event.nativeEvent.data);
          onMessage?.(event);
        }}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
});
