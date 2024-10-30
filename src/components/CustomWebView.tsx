import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import Constants from 'expo-constants';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';

type Props = {
  url: string;
  onMessage?: (event: any) => void;
  onClose?: () => void;
};

// https://making.close.com/posts/react-native-webviews
export const CustomWebView = ({ url, onMessage, onClose }: Props) => {
  const webview = useRef<WebView | null>(null);

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
    webview.current?.stopLoading();
    onClose?.();
  };

  return (
    <Box className="flex-1">
      {webview && (
        <HStack className="px-2">
          <Button onPress={handleClose} variant="link">
            <ButtonText>Close</ButtonText>
          </Button>
        </HStack>
      )}
      <WebView
        ref={webview}
        style={styles.container}
        onMessage={onMessage}
        source={{ uri: url }}
        // originWhitelist={['*']}
        // source={{ html }}
        injectedJavaScript={injectedJavaScript}
        testID="custom-webview"
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
