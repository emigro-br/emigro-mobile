import React, { useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
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

  /**
   * Inject a small JS patch that overrides `window.postMessage` with RN's postMessage
   * so we can intercept events from the web page.
   */
  const injectedJavaScript = `
    (function() {
      var originalPostMessage = window.postMessage;
      var patchedPostMessage = function(message, targetOrigin, transfer) {
        window.ReactNativeWebView.postMessage(message);
      };
      window.postMessage = patchedPostMessage;
    })();
    true; // note: this is required, or you'll sometimes get a silent failure
  `;

  const handleClose = () => {
    console.log('[CustomWebView] handleClose triggered');
    // Stop the WebView from continuing to load
    webviewRef.current?.stopLoading();
    onClose?.();
  };

  /**
   * Additional event callbacks to log what's happening:
   */
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

  /**
   * Some providers block RN default user-agent.
   * Overriding to a typical mobile Chrome or Safari user agent can help.
   */
  const customUserAgent =
    Platform.OS === 'android'
      ? 'Mozilla/5.0 (Linux; Android 10; KadoRNApp) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Mobile Safari/537.36'
      : 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile Safari/605.1.15';

  return (
    <Box className="flex-1">
      {/* A simple top bar with a Close button */}
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

        // Enable cookies and JS/DOM storage
        sharedCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        userAgent={customUserAgent}

        // Inject our JS patch
        injectedJavaScript={injectedJavaScript}

        // Logging event handlers
        onLoadStart={handleLoadStart}
        onLoadProgress={handleLoadProgress}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}

        // The message event callback from the web page
        onMessage={(event) => {
          console.log('[CustomWebView] onMessage ->', event.nativeEvent.data);
          onMessage?.(event);
        }}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // If you want a top padding below the status bar
    paddingTop: Constants.statusBarHeight,
  },
});
