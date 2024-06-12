import { memo,  useRef,  useState } from "react";
import { View, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useAuth } from "@/hooks/index"; 
import fetcher from '@/common/fetcher'
import {regex, auto } from '@/common/common'
import Layout from '@/layout/Layout'

import AppleCard from '@/components/card/apple' 
import AppOfTheDayCard from '@/components/card/dayApp' 
import ColorfulCard from '@/components/card/colorful' 
// import videoPlayer from '@/components/controls/videoPlayer' 
import TimeLine from '@/components/TimeLine'
import Button from '@/components/Button' 
import Highlighter from '@/components/Highlighter' 
import Modal from '@/components/Modal'
// import PickerModal from '@/components/Picker'
// import AnimatedProgress from '@/components/Progress'
// import Bounceable from '@/common/components/Bounceable'; 
import Loading from "@/components/Loading"; 
import Text from "@/common/components/Text";
import {useUpdate} from "@/hooks/index";
import Video from "react-native-video";
import Icon from "@/common/components/Icon";
import configs from "@/common/configs";
// import ImageGrid from "@/components/grids/image";

const { width } = configs.screen
// import { SelectableText } from "@forzys/react-native-selectable-text"

// https://music.163.com/#/song?id=29758362&uct2=Bi9QvLY2gaauSb6jm7cQ3w%3D%3D&fx-wechatnew=t1&fx-wxqd=t1&fx-wordtest=&fx-listentest=t3&shareToken=79608741481715435878_eaf53dfcdc81c3e70d91128f8e4fede7&dlt=0846&app_version=9.0.50

const Home = memo(({ navigation })=>{ 
    const ref = useRef(null)
    const [state, setState] = useUpdate({
        today: auto.dateFormat().format('MM月DD日')
    });
    const [model, setModel] = useState(null)
    const { onCameraPermission } = useAuth(); 
    const [isServer,  setIsServer] = useState(false);
    const [videoOpt,  setVideoOpt] = useState({});
     
    const onSkip = (name)=>{
        return ()=> name && navigation.navigate(name);
    }
    const onGetPermission = ()=>{
        // onCameraPermission().then((_camera)=>{
        //     if(_camera){
        //         setIsCamera(true)
        //     }
        //     navigation.navigate('Receive');
        // })
        navigation.navigate('Receive');
    } 

    const onOpenServer = ()=>{
        if(videoOpt.video) return
        
        let koulin = `6.15 c@A.GV jCh:/ 07/31 2020-04-29【老高与小茉】免費能源 2020-04-29【老高与小茉】免費能源，人类不断消耗资源的真正原因# 知识科普 # 老高与小茉视频 # 老高与小茉 # 老高与小茉会员 # 老高与小茉直播   https://v.douyin.com/i2YBd72T/ 复制此链接，打开Dou音搜索，直接观看视频！`
        const [uri] = koulin?.match(regex.linkRegex);
        Loading.webview({ 
            uri: uri, 
            callback:(res)=>{
                // playwm改成play
                setVideoOpt({ 
                    poster: res?.poster,
                    // video: 'file://' + res2?.path?.replace('playwm','play'), 
                });
                fetcher.get(res?.video, {  appendExt: 'mp4' }).then((res2)=>{ 
                    setVideoOpt({
                        ...res,
                        video: 'file://' + res2?.path?.replace('playwm','play'), 
                    }) 
                })
 
            }
        }) 
    }
    console.log('--- session: ', fetcher.session() )
    const onSelectionNative = (event) => {
        var nativeEvent = event.nativeEvent
        // onSelection && onSelection(nativeEvent);
        const { eventType, content, selectionStart, selectionEnd  } = nativeEvent
        console.log({ eventType, content, selectionStart, selectionEnd  })
    }
    
    // const child = (
    //     <Highlighter onSelection={onSelectionNative}>
    //         React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces.
    //         Use a little—or a lot. You can use React Native today in your existing Android and iOS projects or you can create a whole new app from scratch.
    //         For more please visit https://reactnative.dev or read latest posts from @reactnative.
    //         If you have any question about highlighter please feel free to send me mail at shapouran@gmail.com. 
    //         #react #reactnative #javascript
    //     </Highlighter>
    // )

    const dataImageObject = [
        {
          url:
            'https://images.unsplash.com/photo-1622021211530-7d31fd86862d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80',
          Width: 500,
          Height: 800,
          domainColor: '#e48257',
        },
        {
          url:
            'https://images.unsplash.com/photo-1613766259482-10e3c6682e5d?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0MjN8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
          Width: 500,
          Height: 800,
          domainColor: '#393232',
        },
        {
          url:
            'https://images.unsplash.com/photo-1621570169694-4867389dcc66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80',
          Width: 500,
          Height: 800,
          domainColor: '#393232',
        },
        {
          url:
            'https://images.unsplash.com/photo-1622134093410-ba321c0a6955?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80',
          Width: 500,
          Height: 800,
          domainColor: '#393232',
        },
        {
          url:
            'https://images.unsplash.com/photo-1622024276239-cbefd614cf5b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80',
          Width: 500,
          Height: 800,
          domainColor: '#393232',
        },
        {
          url:
            'https://images.unsplash.com/photo-1622085354806-80fcdcd4ef4a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1700&q=80',
          Width: 500,
          Height: 800,
          domainColor: '#393232',
        },
    ]

    return (
        <Layout>
       
            <ScrollView  style={{ flex: 1  }} contentContainerStyle={{ padding: 12, gap: 12}}> 
                 

                {/* <ImageGrid
                    dataImage={dataImageObject}
                    // onPressImage={onPressImage}
                    widthKey={'Width'}
                    heightKey={'Height'}
                    // spaceSize={10}
                    // width={Dimensions.get('window').width - 6}
                    ratioImagePortrait={1.2}
                    ratioImageLandscape={1.618}
                    prefixPath={Platform.OS === 'android' ? 'file://' : ''}
                    backgroundColorKey={'domainColor'}
                /> */}
 

                <AppleCard
                    backgroundStyle={{ width:'100%' }}
                    source={{uri: 'https://img2.woyaogexing.com/2024/04/30/0ce8ebf557130a2b!400x400.jpg'}}
                    onPress={onSkip('Summary')}
                    smallTitle={"Today " + state?.today}
                    largeTitle={"每日摘要"}
                    footnote={ "This card is updated daily with hot news, headline hot lists. Tap to learn more." }
                />
            
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
                     {
                         [
                            { name:'Sleep', info: 'RSS在线订阅，随时随地获取最新资讯', key:'sleeps', bgcolor: '#0fa968', icon:'sleep', size:24, title: '小睡眠' }, 
                            { name:'Feeds', info: 'RSS在线订阅，随时随地获取最新资讯', key:'feeds', bgcolor: '#7954ff', icon:'rss-feed', size:24, title: 'RSS订阅' }, 
                            { name:'Short', info: '短视频在线解析，无水印解析，保存至本地', key:'short', bgcolor: '#808836',icon:'video-switch', size:24,  title: '短视频转存' },
                            { name:'Server',info: '手机开启服务器 局域网连接 可传输文件等', key:'server',bgcolor: '#DBB5B5', icon:'server', size:20,  title: 'HTTP服务器' },
                            { name:'',info: '更多内容正在准备...', key:'more',bgcolor: '#a1a1a1', icon:'more', size:20,  title: '更多' },
                        ].map(item=>{
                            return (
                                <ColorfulCard 
                                    key={item.key}
                                    title={item.title}
                                    value={item.info}
                          
                                    valueTextStyle={{
                                        fontSize: 12,

                                    }}
                                    // footerTitle={item.info}
                                    icon={( <Icon icon={item.icon} color="#FFF" size={item.size} /> )}
                                    iconContainerStyle={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 42,
                                        
                                    }}
                                    style={{ 
                                        backgroundColor: item?.bgcolor,
                                        height: width * 0.45,
                                        width: width * 0.42,
                                    }}
                                    footerTextStyle={{
                                        textAlign:'left',
                                        backgroundColor:'red' 
                                    }}
                                    onPress={onSkip(item.name)}
                                    onLongPress={onSkip()}
                                />
                            )
                        })
                     }
                </ScrollView>
                
            </ScrollView>
 
                {/* <PickerModal
                    title="You can either take a picture or select one from your album."
                    isVisible={!!state?.isVisible}
                    data={["Take a photo", "Select from album"]}
                    onPress={(selectedItem, index) => {
                        console.log({ selectedItem, index });
                    }}
                    onCancelPress={() => {
                        setState({ isVisible: false });
                    }}
                    onBackdropPress={() => {
                        setState({ isVisible: false });
                    }}
                /> */}
                
        </Layout>
    )
})


export default Home