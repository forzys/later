
import { memo, useMemo } from 'react';
import RenderHtml from 'react-native-render-html';
import Layout from '@/layout/Layout';
import configs from "@/common/configs";
import { ScrollView, View } from 'react-native';
import { WebView } from 'react-native-webview'
const { width } = configs.screen

const RssRenderHTML = memo(({ route })=>{

    const [content, title, uri] = useMemo(()=>{ 
        const {content, title, links} = route.params
        const [first] = links
        return [content, title, first.url]
    },[]) 
 
    // console.log({ content, uri })
    
    return (
        <Layout title={title}>
            <View style={{flex: 1, padding: 12 }}> 
                <WebView
                    source={{ uri }}
                    style={{ flex:1, opacity: 0.99 }}
                    originWhitelist={['*']}
                />
            </View> 
        </Layout>

    )
})

export default RssRenderHTML