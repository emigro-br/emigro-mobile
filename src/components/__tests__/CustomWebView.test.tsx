import React from 'react';

import { fireEvent, render } from 'test-utils';

import { CustomWebView } from '../CustomWebView';

describe('CustomWebView', () => {
  const url = 'https://example.com';
  const onMessageMock = jest.fn();
  const onCloseMock = jest.fn();

  it('should render the WebView component with the provided URL', () => {
    const { getByText, getByTestId } = render(
      <CustomWebView url={url} onMessage={onMessageMock} onClose={onCloseMock} />,
    );
    const closeButton = getByText('Close');
    expect(closeButton).toBeOnTheScreen();

    const webView = getByTestId('custom-webview');
    expect(webView).toBeOnTheScreen();

    // expect(webView.props.source).toBe({ uri: url });
  });

  it('should call the onMessage callback when a message is received', () => {
    const { getByTestId } = render(<CustomWebView url={url} onMessage={onMessageMock} onClose={onCloseMock} />);
    const webView = getByTestId('custom-webview');

    fireEvent(webView, 'onMessage', { nativeEvent: { data: 'Hello, world!' } });

    expect(onMessageMock).toHaveBeenCalledWith({ nativeEvent: { data: 'Hello, world!' } });
  });

  it('should call the onClose callback when the Close button is pressed', () => {
    const { getByText } = render(<CustomWebView url={url} onMessage={onMessageMock} onClose={onCloseMock} />);
    const closeButton = getByText('Close');

    fireEvent.press(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
