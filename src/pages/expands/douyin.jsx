import { memo, useEffect, useRef, useState } from "react";
import { View, ScrollView, Text as RNText } from "react-native";
 
import configs from '@/common/configs'
import { auto, regex } from '@/common/common'
import fetcher from '@/common/fetcher'
import Text from '@/common/components/Text'
import Layout from '@/layout/Layout'
import Bounceable from '@/common/components/Bounceable'  
import Loading from "@/components/Loading";
import Card, {ButtonCard} from "@/components/Card";
import Input from "@/components/Input";
import Video from "@/components/Video";
import {useUpdate} from "@/hooks/index";
import { useStorage } from '@/hooks/index'
const { width } = configs.screen

 
const Douyin = memo(({ navigation })=>{
    const [init] = useState({
        runJs: `
            const poster = document.querySelector('.poster').src
            const video = document.getElementById('video-player').src
            window.ReactNativeWebView.postMessage(JSON.stringify({ video:video, poster: poster }))
        `,
        runMsg:(event)=>{
           return auto.widthTry(()=> JSON.parse(event.nativeEvent.data), {})
        }
    }); 

    const [storage] = useStorage('later.history', { security: false });
    const { current } = useRef({ content: '9.25 A@g.BT WmD:/ 12/15 你以为的死亡可能并没有死，你以为的正常，可能已经变化 # 揭秘  https://v.douyin.com/i2P7o9pp/ 复制此链接，打开Dou音搜索，直接观看视频！' })
    const [state, setState] = useUpdate({ history: [] });
 
    const onSaveHistory = (info)=>{
        if(info?.key){ 
            current.douyin = current.douyin || []
            current.douyin?.unshift(info);
            storage.set('douyin', JSON.stringify(current.douyin))
        }
        return [current.douyin, info]
    }

    const onShowMore = ()=>{
        navigation.navigate('Modal', { name: 'douyin', title:'历史记录', options: state?.history })
    }

    const onShowHistory = (item)=>{
        return ()=>{
            setState({
                ...item,
                autoplay: true,
            });
        }
    }

    const callback = (res, uri)=>{
        const video = res?.video?.replace('playwm','play');
        const uris = uri?.split('/')?.filter(Boolean); 
        const key = uris?.pop(); 

        fetcher.get(video, { path: `douyin/${key}.mp4` }).then((ext)=>{
            const index = current?.content?.search(/[\u4e00-\u9fa5]/);
          
            const [history, info] = onSaveHistory({
                ...res,
                key: key,
                uri: uri,
                origin: current?.content,
                title: current?.content?.slice(index === -1 ? 0 : index - 1)?.split('#')?.shift(),
                video: ext?.path,
                timetamp: auto.dateFormat().format('YYYY-MM-DD hh:mm:ss')
            })

            setState({
                ...res,
                ...info,
                autoplay: false,
                history: history,
            });

            current.content = null
        }) 
    }

    const onMatchLink = ()=>{ 
        try{
            current.douyin = current.douyin || [] 
            const [uri] = current?.content?.match(regex?.linkRegex) || []
            if(!uri) return;  
        
            const find  = current?.douyin?.find(i=> i?.uri === uri);

            if(find){
                return setState({
                    ...find,
                });
            }
 
            Loading.webview({ 
                uri: uri, 
                runJs: init.runJs,
                runMsg: init.runMsg,
                callback:(res)=> callback(res, uri),
            })
        }catch(e){ 
            console.log({e})

        } 
    }
      
    useEffect(()=>{ 
        if(storage){
            const douyin = auto.jsonFormat(storage?.getString('douyin'), []); 
            current.douyin = douyin;
            setState({ history: douyin })
        }
    },[storage]);
 
 

    return (
        <Layout style={{ paddingHorizontal: 12, padding:12, alignItems:'center' }}>
            <View style={{ width: '100%', gap: 12 }}>
                <View style={{ flexDirection:'row',  gap: 12 }}>
                    <Input
                        placeholder="输入抖音分享链接" 
                        onChangeText={text=>{  current.content = text }}
                        textInputStyle={{ flex: 1  }}
                        style={{flex: 1 }}
                        iconStyle={{ backgroundColor:'white',  }}
                    />

                    <ButtonCard onPress={()=>{ onMatchLink(); Loading.show({ text: '解析中...', delay: 1000 }) }}>解析</ButtonCard>
                </View>

                <Video
                    autoplay={state?.autoplay ? state?.video : false}
                    poster={state?.poster}
                    src={state?.video || ''} 
                    title={state?.title || state?.origin?.split('#')?.shift()}
                    empty={(<Text style={{zIndex:1000,color:"#FFF"}}>当前视频为空</Text> )}
                    style={{ borderRadius: 6, backgroundColor:'#000', width:'100%',  height:(width * 0.9 * 0.7),   alignSelf:'center', marginTop: 24 }}
                />

                {
                    state.video ? (
                        <View style={{ flexDirection:'row', gap: 12, justifyContent:'flex-end'}}>
                            <ButtonCard>下载封面</ButtonCard>
                            <ButtonCard>下载视频</ButtonCard>
                            <ButtonCard>下载音乐</ButtonCard>
                        </View>
                    ) : <View style={{ height: 40 }} />
                } 
            </View>
                

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection:'row', marginVertical: 12, justifyContent:'space-between' }}>
                    <Text>历史记录</Text> 
                    {
                        Boolean(state?.history?.length > 3) && (
                            <Bounceable onPress={onShowMore}>
                                <Text>更多</Text>
                            </Bounceable> 
                        )
                    }
                </View>

                <ScrollView style={{ width:'100%', flex: 1, }} contentContainerStyle={{ gap:12 }}>
                    {
                        state?.history?.map(item=>{
                            return (
                                <Card key={item?.key} style={{  width:'100%', overflow:'hidden' }} onPress={onShowHistory(item)}>
                                    <View style={{ width:'100%', borderRadius:8, paddingVertical: 8 }} key={item.key}>
                                        <Text numberOfLines={1}>{item.title || item?.origin}</Text>
                                    </View>
                                </Card> 
                            )
                        }) 
                    }
                </ScrollView> 
            </View> 
       
        </Layout>
    )
})
export default Douyin