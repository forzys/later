import { memo, useMemo, useRef, useState } from "react";
import { View, ScrollView, Image } from "react-native";
import { useUpdate } from "@/hooks/index"; 
import Card, { WarpCard } from "@/components/Card";
import DraggableGrid from "@/components/Draggable";
import Stagger from "@/common/components/Stagger";
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'
import configs from '@/common/configs'
import Layout from "@/layout/Layout";
import Sheet from "@/components/Sheet";
import Bounceable from '@/common/components/Bounceable' 


const screen = configs.screen

const Expand = memo(({ navigation })=>{
    const sheetRef = useRef(null)
    const [config] = useState({
        data: [
            { name:'Fonts', key:'font', title: '更多字体' },
            { name:'Short', key:'short', title: '短视频转存' },
            { name:'Server', key:'server', title: 'HTTP服务器' },
            { name:'Feeds', key:'feeds', title: 'RSS订阅' },
            { name:'Summary', key:'summary', title: '每日摘要' },
            { name:'Countdown', key:'countdown', title: '人生倒计时', disabled: true },
            { name:'Sleep', key:'sleep', title: '小睡眠', disabled: true },
        ]
    });
    const [state, setState] = useUpdate({
        data: config.data,
        scrollEnabled: true,
        columns: 3,
    });
 
    const goto = (item)=>{
        navigation.navigate(item?.name)
    } 
 
    const [width, height] = useMemo(()=>{
        const width = screen.width
        const column = state.columns 
        const _width =  (width - 12 * 2 - (column - 1) * 12) / column
        const _height = _width; 
        return [_width, _height]
    }, [state.columns]) 

    return (
        <Layout style={{ padding: 12 }}>

            <View style={{ height: 48 }}> 
                <Bounceable onPress={()=>sheetRef?.current?.open()}>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:3, position:'absolute', right: 0, width: 80, padding: 6  }}>
                        <Icon disabled icon="info-circle" size={12} color="#afafaf" />
                        <Text t4 style={{marginTop: -2}} color="#afafaf">长按排序</Text>
                    </View>
                </Bounceable>
            </View>

            <DraggableGrid
                onItemPress={goto}
                numColumns={state.columns}
                renderItem={(item)=> false ? (
                    <View style={{ alignItems:'center',  opacity: item?.disabled ? 0.6 : 1, width: width, height:height, padding: 6, borderRadius:8 , overflow:'hidden', backgroundColor: '#ccc' }} key={item.key}>
                        <Image source={{ uri: 'https://img2.woyaogexing.com/2024/04/30/0ce8ebf557130a2b!400x400.jpg' }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
                        <View style={{ position:'absolute', bottom: 0, left: 0, right: 0, height: Math.floor(height / 3), backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }}>
                            <Text t3 center color="#FFF">{item.title}</Text>
                        </View> 
                    </View>
                ): (
                    <View style={{ alignItems:'center', opacity: item?.disabled ? 0.6 : 1, width: width, height: height,  overflow:'hidden',  }} key={item.key}>
                        <View style={{ borderRadius:8, width:'80%', height: '80%', overflow: 'hidden',   }}>
                            <Image source={{ uri: 'https://img2.woyaogexing.com/2024/04/30/0ce8ebf557130a2b!400x400.jpg' }} style={{ width:'100%', height:'100%'  }} />
                        </View>
                     
                        <View style={{ justifyContent:'center', alignItems:'center', flex: 1 }}>
                            <Text t3 center color="#0f0f0f">{item.title}</Text>
                        </View> 
                    </View>
                )}
                data={state?.data}
                onDragRelease={(data) => {
                    setState({ data: [...data] })
                }}
            />
 
            <View style={{ paddingTop: 24, alignItems:'center', zIndex: -1 }}>
                <Text t4 color="#d1d1d1">更多内容正在准备</Text> 
            </View> 


            <Sheet ref={sheetRef} style={{ paddingHorizontal: 12,}}>
                <Text>说明：</Text>
                <Text t3>长按卡片后可重新排序</Text>
            </Sheet> 
        </Layout>
    )
})

export default Expand