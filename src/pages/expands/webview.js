

import { WebView } from 'react-native-webview'

const webviews = ({ uri, callback })=>{
    const onRunJs = ()=>{
        return ` 
            const src = document.getElementById('video-player').src
            window.ReactNativeWebView.postMessage(src)
        `
    }

    return (
        <WebView 
            source={{ uri: uri }}
            style={{ width: 150, height: 150, opacity: 0.99 }}
            injectedJavaScript={onRunJs()}
            onMessage={(event) => {
                // console.log('--data', event.nativeEvent.data)
                callback({ 
                    data: event.nativeEvent.data 
                })
            }}
        />
    )
}


export default webviews