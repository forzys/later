import { memo, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView,ActivityIndicator, Image, Keyboard } from "react-native";
import configs from '@/common/configs'
import { auto, regex, assets} from '@/common/common'
import fetcher from '@/common/fetcher'
import Text from '@/common/components/Text'
import Layout from '@/layout/Layout'
import Bounceable from '@/common/components/Bounceable'  
import Loading from "@/components/Loading";
import Card, {ButtonCard, WarpCard} from "@/components/Card";
import Input from "@/components/Input";
import {Received} from "@/components/Progress";
// import Video from "@/components/Video";
import Video from 'react-native-video';
import Sheet from "@/components/Sheet";
import { RoundedCheckbox  } from "@/components/Checkbox";
import {useUpdate, useReceive} from "@/hooks/index";
import { useStorage } from '@/hooks/index'
import Icon from "@/common/components/Icon";
const { width } = configs.screen


const Douyin = memo(({ navigation })=>{
    const [init] = useState({
        platform: {
            douyin: `
                const poster = document.querySelector('.poster').src
                const video = document.getElementById('video-player').src
                window.ReactNativeWebView.postMessage(JSON.stringify({ video:video, poster: poster }))
            `,
            pipix:`
                const { pathname, href } = window.location 
                window.ReactNativeWebView.postMessage(JSON.stringify({ pathname, href }))
            `
        }, 
        runMsg:(event)=>{
            // console.log('back')
           return auto.try(()=>JSON.parse(event.nativeEvent.data), {})
        }
    });  
    const progressRef = useRef(null);
    const sheetRef = useRef(null);
    const { onGetHistory, onSetHistory, historyKey } = useReceive()
 
    const { current } = useRef({ content: '' })
   
    const [state, setState] = useUpdate({ history: [] });

    const options = useMemo(()=>{
        return onGetHistory('douyin')
    },[historyKey])


    const onSaveHistory = (info)=>{ 
        const history = [...options]; 
        if(info?.key){
            history?.unshift(info); 
            onSetHistory('douyin', history)
        }
        return [history, info]
    }

    const onShowMore = ()=>{
        navigation.navigate('Modal', { name: 'Douyin', title:'历史记录', options: state?.history })
    }

    const onShowPlatform = ()=>{ 
        sheetRef.current.open(); 
    }

    const onShowHistory = (item)=>{
        return ()=>{
            setState({ ...item, autoplay: true });
        }
    }

    const douyinCallback = (res, uri, name = 'douyin')=>{ 
        const video = res?.video?.replace('playwm','play');
        const uris = uri?.split('/')?.filter(Boolean); 
        const key = uris?.pop();

        fetcher.get(video, { path: `${name}/${key}.mp4` }, (received, total)=>{
            progressRef?.current?.setProgress(Math.floor((received / total) * 100) + '%')
        }).then((ext)=>{
            const index = current?.content?.search(/[\u4e00-\u9fa5]/);
            const [history, info] = onSaveHistory({
                ...res,
                key: key,
                type: name,
                uri: uri,
                origin: current?.content,
                title: res?.title || current?.content?.slice(index === -1 ? 0 : index - 1)?.split('#')?.shift(),
                video: ext?.path,
                timetamp: auto.dateFormat().format('YYYY-MM-DD hh:mm:ss')
            });

            setState({
                ...res,
                ...info,
                autoplay: false,
                history: history, 
                loading: false
            });

            current.content = null
        })
    } 

    const pipixCallback = (res, uri)=>{ 
        const {  href, pathname } = res
        const id = pathname?.replace('/item/', '')
        const path = `https://is.snssdk.com/bds/cell/detail/?cell_type=1&aid=1319&app_name=super&cell_id=${id}`

        fetch(path).then((res)=>res.json()).then((res)=>{ 
            const { data } = res?.data
            const { origin_video_download, share, content } = data?.item 
            const { cover_image, url_list } = origin_video_download
            const poster = cover_image?.url_list[0]?.url
            const video = url_list[0]?.url
            const title = content || share?.title

            douyinCallback({
                poster,
                video,
                title,
            }, pathname, 'pipix');

        }).catch(e=>{ console.log({ e }) })
    }
 
    const onMatchLink = ()=>{
        try{

            setState({ loading: true, video: null })

            Keyboard.dismiss()
            const [uri] = current?.content?.match(regex?.linkRegex) || [];
            if(!uri) return;

            const key = uri?.indexOf('douyin.') !== -1 ? 'douyin' :  uri?.includes('pipix.') !== -1 ? 'pipix' : 'douyin'
            const find = options?.find(i=> i?.uri === uri);

            if(find){
                return setState({ ...find });
            }

            const callbacks = {
                douyin: (res)=> douyinCallback(res, uri),
                pipix: (res)=> pipixCallback(res, uri),
            }
 
            const runJs = init.platform[key] 
    
            Loading.webview({ 
                uri: uri, 
                runJs: runJs,
                runMsg: init.runMsg,
                callback:callbacks[key],
            })
        }catch(e){ 
            console.log({e})

        } 
    } 

    const onSkipMedia = ()=>{
        navigation.navigate('Media', { })
    }

    return (
        <Layout back style={{ padding: 12,  alignItems:'center' }}>
            <View style={{ width: '100%', gap: 12 }}>
                <View style={{alignItems:'flex-end'}}>
                    <Text t4 color="#7469b6" onPress={onShowPlatform}>支持平台</Text>
                </View>
               
                <View style={{ flexDirection:'row',  gap: 12 }}>
                    <Input
                        placeholder="输入短视频分享链接" 
                        onChangeText={text=>{ current.content = text }}
                        textInputStyle={{ flex: 1  }}
                        style={{flex: 1 }}
                        clearTextOnFocus
                        iconStyle={{ backgroundColor:'white',  }}
                    />

                    <ButtonCard onPress={()=>{ onMatchLink(); Loading.show({ text: '解析中...', delay: 1000 }) }}>解析</ButtonCard>
                </View>

                {
                    state?.video ? (
                        <View style={{  width:'100%', height:(width * 0.9 * 0.7), overflow:'hidden', backgroundColor:'#000',borderRadius: 6, alignSelf:'center', marginTop: 12 }}>
                            <Video 
                                autoplay={state?.autoplay ? state?.video : false}
                                cache={false}
                                fullscreenAutorotate={true}
                                playWhenInactive={true}
                                posterResizeMode="contain"
                                resizeMode="contain"
                                poster={state?.poster} 
                                source={{ 
                                    uri: state?.video || '',
                                    metadata: {
                                        title: state?.title || state?.origin?.split('#')?.shift(), 
                                    }
                                }}
                                controls 
                                style={{ flex: 1, }}
                                bufferConfig={{
                                    minBufferMs: 15000,
                                    maxBufferMs: 20000,
                                    bufferForPlaybackMs: 2500,
                                    bufferForPlaybackAfterRebufferMs: 5000,
                                }}
                            />
                        </View>
                    ): (
                        <View style={{ backgroundColor:'#000', alignItems:'center', justifyContent:'center', borderRadius: 6, width:'100%', height:(width * 0.9 * 0.7), alignSelf:'center', marginTop: 12 }}>
                            {
                                state?.loading ? ( 
                                    <View style={{alignItems:'center', justifyContent:'center'}}>
                                        <ActivityIndicator />
                                        <Text style={{ zIndex:1000,color:"#FFF"}}>正在解析 <Received ref={progressRef} /></Text> 
                                    </View>
                                ): ( <Text style={{ zIndex:1000,color:"#FFF"}}>当前视频为空</Text> )
                            } 
                        </View>
                    )
                }

                <Bounceable onPress={onSkipMedia}>
                    <View style={{ position:'absolute', right: -28, width: 68, padding: 6, borderTopLeftRadius: 24, borderBottomLeftRadius: 24, backgroundColor:'#7469b6' }}>
                        <Icon icon="menu-open" size={28} color="#f3ca52"  /> 
                    </View>
                </Bounceable>
                <View style={{ height: 25  }} />
                
            </View>
                

            <View style={{ flex: 1 }}>
                <View style={{ width:'100%', flexDirection:'row', marginVertical: 12, justifyContent:'space-between' }}>
                    <Text color="#a1a1a1">历史记录</Text>
                    <Bounceable onPress={onShowMore}>
                        <Text>更多</Text>
                    </Bounceable> 
                </View>

                <ScrollView style={{ width:'100%', flex: 1, }} contentContainerStyle={{ gap:12 }}>
                    {
                        options?.map(item=>{
                            return (
                                <Card key={item?.key} style={{ flexDirection:'row', alignItems:'center', gap: 6,  width:'100%', overflow:'hidden' }} onPress={onShowHistory(item)}>
                                    {
                                        item.type && <Image source={assets?.platform?.[item.type]} style={{ width: 20, height:20}} />
                                    }
                                    <View style={{ flex: 1, borderRadius:8, paddingVertical: 8 }} key={item.key}> 
                                        <Text numberOfLines={1}>{item.title || item?.origin}</Text>
                                    </View>
                                </Card> 
                            )
                        }) 
                    }
                </ScrollView> 
            </View>
 
            <Sheet ref={sheetRef} style={{ paddingHorizontal: 12,}}>
                <WarpCard style={{ width:'100%', gap: 6, flexWrap:'wrap'}}>
                    {
                        [
                            { title: '抖音', key: 'douyin' , checked: true },
                            { title: '皮皮虾', key: 'pipix', checked: true  },
                            { title: '火山', key: 'huoshan' , checked: false },
                            { title: '快手', key: 'kuaishou', checked: false  },
                            { title: '皮皮搞笑', key: 'gaoxiao', checked: false  },
                            { title: '西瓜', key: 'xigua', checked: false  },
                            { title: '虎牙', key: 'huya', checked: false  },
                            { title: '美拍', key: 'meipai', checked: false  },
                            { title: '全民K歌', key: 'kge', checked: false  },
                            { title: '微视', key: 'weishi', checked: false  },
                            { title: '微博', key: 'weibo', checked: false  },
                            { title: '最右', key: 'zuiyou', checked: false }, 
                            { title: '...', key: 'more', checked: false }, 
                        ]?.map(item=>{
                            return ( 
                                <RoundedCheckbox 
                                    key={item.key} 
                                    isChecked={item?.checked}
                                    active={false}
                                    onPress={(checked) => console.log("Checked: ", checked)} 
                                    size={50}
                                > 
                                    <Text t4>{item.title}</Text>
                                </RoundedCheckbox> 
                            )
                        })
                    }
                </WarpCard>
            </Sheet> 
        </Layout>
    )
})
export default Douyin