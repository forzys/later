import { WebView } from 'react-native-webview'

// const onLoaded = () => {
//     console.log('---Loaded')
//     const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36';
//     webviewRef.current?.injectJavaScript(`navigator.userAgent = '${desktopUserAgent}';`);
// };

const webviews = ({ runJs, runMsg, runLoad, uri, callback })=>{
    // const webviewRef = useRef(null);
    return (
        <WebView 
            // ref={webviewRef}
            source={{ uri: uri }}
            style={{ width: 1, height: 1, opacity: 0.99 }}
            injectedJavaScript={runJs}
            onMessage={(event)=>{
                callback?.(runMsg?.(event) )
            }}
            onLoadEnd={runLoad}
        />
    )
}
export default webviews