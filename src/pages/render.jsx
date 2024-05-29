
import { memo, useMemo } from 'react';
import Card, { WarpCard } from "@/components/Card";
import Text from "@/common/components/Text";
import Popup from "@/common/components/Popup";
import Layout from '@/layout/Layout';
import configs from "@/common/configs";
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'
 
const { width } = configs.screen

const RssRenderHTML = memo(({ navigation, route })=>{

    const [title, uri] = useMemo(()=>{ 
        const { title, uri } = route.params
        return [title, uri]
    },[route.params])
    
    const goBack = ()=>{
        
    }
    return (
        <Layout title={title} onLeftPress={()=>{goBack}} rightIcon="close" titleTextStyle={{ width: '60%'}} onRightPress={navigation.goBack}>
            {
                uri ? (
                    <View style={{ flex: 1, margin: 12, overflow:'hidden', borderRadius: 8 }}> 
                        <WebView
                            source={{ uri: uri }}
                            style={{ flex:1, opacity: 0.99  }} 
                            originWhitelist={['*']}
                            menuItems={[{ label: '复制', key: 'tweet' }, { label: '收藏到备忘', key: 'saveForLater' }]}
                            onCustomMenuSelection={()=>{

                            }}
                            onError={(ev) => {
                                Popup?.show({
                                    title: '加载出错',
                                    textBody: '该网页加载出现错误，无法正常显示',
                                    autoHidden: true,
                                    timing:1000,
                                })
                            }}
                            onFileDownload ={ ({ nativeEvent }) => {
                                const { downloadUrl } = nativeEvent;
                                Popup?.show({
                                    title: '打开浏览器',
                                    textBody: '确定打开外部浏览器吗',
                                    autoHidden: true,
                                    timing:1000,
                                })
                            }}
                            onHttpError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.warn(
                                  'WebView received error status code: ',
                                  nativeEvent.statusCode,
                                );
                                Popup?.show({
                                    title: '打开浏览器',
                                    textBody: '确定打开外部浏览器吗',
                                    autoHidden: true,
                                    timing:1000,
                                })
                              }}
                        />
                    </View>
                ): (
                    <WarpCard style={{ width: '100%',  padding: 24,  alignItems:'center', justifyContent:'center'}}>
                        <ActivityIndicator size="large"  />
                        <Text>数据正在加载</Text> 
                    </WarpCard> 
                )
            } 
        </Layout>
       

    )
})

export default RssRenderHTML