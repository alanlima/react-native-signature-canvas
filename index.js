import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import htmlContent from './h5/html';
import injectedSignaturePad from './h5/js/signature_pad';
import injectedApplication from './h5/js/app';

const styles = StyleSheet.create({
  signature: {
    width: 200,
    height: 110,
    borderWidth: 2,
    borderColor: 'grey'
  },
  signaturBg: {
    alignItems: 'center',
    marginTop: 20
  },
  webView: {},
  webBg: {
    width: '100%',
    backgroundColor: '#FFF',
    flex: 1
  }
});

const defaultSignatureCanvasOptions = {
  backgroundColor: 'rgba(0,0,0,0)',
  imageDataType: 'image/png',
  encoderOptions: 0.92
};

const SignatureView = ({
  webStyle = '',
  onOK = () => { },
  onEmpty = () => { },
  onChange = () => { },
  onError = (error) => console.error(error),
  descriptionText = 'Sign above',
  clearText = 'Clear',
  confirmText = 'Confirm',
  signatureCanvasOptions = defaultSignatureCanvasOptions
}, ref) => {

  const messageReceived = React.useCallback((event) => {
    const action = JSON.parse(event.nativeEvent.data);
    switch (action.type) {
      case 'EMPTY':
        onEmpty();
        break;
      case 'ON_CHANGE':
        onChange(action.base64DataUrl);
        break;
      case 'SAVE':
        onOK(action.base64DataUrl);
    }
  }, [ onOK, onEmpty, onChange ]);

  const source = React.useMemo(() => {
    const injectedJavaScript = injectedSignaturePad + injectedApplication;

    let html = htmlContent(injectedJavaScript);
    html = html.replace('<%style%>', webStyle);
    html = html.replace('<%description%>', descriptionText);
    html = html.replace('<%confirm%>', confirmText);
    html = html.replace('<%clear%>', clearText);
    html = html.replace('<%canvasOptions%>', JSON.stringify(signatureCanvasOptions || '{}'));

    return { html };
  }, [ webStyle, descriptionText, confirmText, clearText, signatureCanvasOptions ]);

  const webRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      const run = `
        signaturePad.clear();
        true;
      `;
      webRef.current.injectJavaScript(run);
    }
  }));

  return (
    <View style={styles.webBg}>
      <WebView
        ref={webRef}
        useWebKit={true}
        style={styles.webView}
        source={source}
        onMessage={messageReceived}
        javaScriptEnabled={true}
        onError={onError}
      />
    </View>
  );
};

export default React.forwardRef(SignatureView);