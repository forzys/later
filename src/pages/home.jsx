import { memo,  useRef,  useState } from "react";
import { View, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useAuth } from "@/hooks/index"; 
import fetcher from '@/common/fetcher'
import {regex} from '@/common/common'
import Layout from '@/layout/Layout'
import AppleCard from '@/components/card/apple' 
import AppOfTheDayCard from '@/components/card/dayApp' 
 
import Button from '@/components/Button' 
import Highlighter from '@/components/Highlighter' 
import Modal from '@/components/Modal'
import PickerModal from '@/components/Picker'
import AnimatedProgress from '@/components/Progress'
import Bounceable from '@/common/components/Bounceable'; 
import Loading from "@/components/Loading"; 
import Text from "@/common/components/Text";
import {useUpdate} from "@/hooks/index";
import Video from "react-native-video";
import { SelectableText } from "@forzys/react-native-selectable-text"

// https://music.163.com/#/song?id=29758362&uct2=Bi9QvLY2gaauSb6jm7cQ3w%3D%3D&fx-wechatnew=t1&fx-wxqd=t1&fx-wordtest=&fx-listentest=t3&shareToken=79608741481715435878_eaf53dfcdc81c3e70d91128f8e4fede7&dlt=0846&app_version=9.0.50

const Home = memo(({ navigation })=>{ 
    const ref = useRef(null)
    const [state, setState] = useUpdate({});
    const [model, setModel] = useState(null)
 
    const { onCameraPermission } = useAuth(); 
    const [isServer,  setIsServer] = useState(false);
    const [videoOpt,  setVideoOpt] = useState({});
     
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
    
    const child = (
        <Highlighter onSelection={onSelectionNative}>
            React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces.
            Use a little—or a lot. You can use React Native today in your existing Android and iOS projects or you can create a whole new app from scratch.
            For more please visit https://reactnative.dev or read latest posts from @reactnative.
            If you have any question about highlighter please feel free to send me mail at shapouran@gmail.com. 
            #react #reactnative #javascript
        </Highlighter>
    )

    return (
        <Layout>
       
            <ScrollView  style={{flex: 1}} contentContainerStyle={{ paddingVertical: 12, gap: 12}}> 
                
                {/* <View style={{alignSelf:'center', alignItems: 'center', flex: 1,  }}> 
                    
                    <Bounceable onPress={()=> onOpenServer()} >
                        <Text>OPEN Douyin jiexi</Text> 
                    </Bounceable>

                    <AnimatedProgress
                        size={30}
                        width={5}
                        fill={40}
                        tintColor="#000"
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#FFF" 
                    />

                    <SelectableText 
                        menuItems={["标记", "分享", "收藏", "解析"]}
                        onSelection={({ eventType, content, selectionStart, selectionEnd }) => {
                            console.log({ eventType, content,  selectionStart, selectionEnd })
                        }}
                        // highlights={[ { start: 12, end: 20, color: 'red' }]}
                        textComponentProps={{ children: child, selectable:false } }
                    />
                       

                    <View style={{ marginTop: 48  }}>
                        <TouchableOpacity onPress={()=> onGetPermission()}>
                            <Text>OPEN</Text>
                        </TouchableOpacity>
                    </View> 

                    <View style={{ marginTop: 48  }}>
                        <TouchableOpacity onPress={()=> setState({ isVisible: true })}>
                            <Text>OPEN</Text>
                        </TouchableOpacity>
                    </View> 
                </View> */}
                <View style={{alignSelf:'center'}}>  
                    <AppleCard
                        source={{uri: 'https://img2.woyaogexing.com/2024/04/30/0ce8ebf557130a2b!400x400.jpg'}}
                        onPress={() => {}}
                        smallTitle={"Today 5月14"}
                        largeTitle={"每日摘要"}
                        footnote={ "This card is updated daily with hot news, headline hot lists. Tap to learn more." }
                    />
                </View> 
            </ScrollView>


            <Modal
                isOpen={!!videoOpt.poster} 
                style={[{ justifyContent: 'center',  alignItems: 'center', alignSelf:'center'}]}
                swipeToClose={state.swipeToClose}
                onClosed={()=>console.log('closed')}
                onOpened={()=>console.log('opend')}
                onClosingState={()=>console.log('closing')}
            >

                <Text>Basic modal</Text>
                <Button
                    title={`Disable swipeToClose(${state.swipeToClose ? "true" : "false"})`} 
                    onPress={() => setState({ swipeToClose: !state.swipeToClose })} 
                    style={{
                        margin: 10,
                        backgroundColor: "#3B5998",
                        color: "white",
                        padding: 10
                    }} 
                />

                <View style={{alignSelf:'center'}}> 
                    <AppOfTheDayCard
                        title={"Colorfy: Coloring Art Games"}
                        subtitle={"Drawing & painting for  everyone"}
                        largeTitle={"APP" +  "OF THE" + "DAY"}
                        buttonText={"GET"}
                        iconSource={{uri:'https://img2.woyaogexing.com/2024/04/30/879ddd0c0d899daa!400x400.jpg'}}
                        backgroundSource={{uri: videoOpt?.poster || 'https://img2.woyaogexing.com/2024/04/30/e9d9f2c7cc108ede!400x400.jpg'}}
                        buttonSubtitle={"In-App Purchases"}
                        onPress={() => {}}
                        onButtonPress={() => {}}
                    >
                        {
                            !!videoOpt?.video && (
                                <View>
                                    <Video 
                                        source={{ uri: videoOpt?.video }}
                                        style={{ width: '100%', height: '100%' }}
                                        rate={1} volume={10} muted={true}
                                        resizeMode="cover" repeat={true}
                                    />
                                </View>
                            )
                        }
                    </AppOfTheDayCard>
                </View> 
            </Modal> 


              

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