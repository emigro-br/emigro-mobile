import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { Box, Button, ButtonText, HStack } from '@gluestack-ui/themed';
import Constants from 'expo-constants';

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
    console.debug('close');
    webview.current?.stopLoading();
    onClose?.();
  };

  return (
    <Box flex={1}>
      {webview && (
        <HStack px="$2">
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
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    // backgroundColor: '#ecf0f1',
  },
});
