import { memo, useCallback, useMemo, useRef } from "react";
import { View, ScrollView, Image, Keyboard } from "react-native";
import rssParser from '@/common/lib/rssParser'
import Text from '@/common/components/Text' 
import Card, { ButtonCard, WarpCard, } from "@/components/Card";  
import Layout from "@/layout/Layout"; 
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import { useUpdate } from '@/hooks/index'
import Icon from "@/common/components/Icon"; 
import favicons from "@/common/favicons"; 
import RNBounceable from '@/common/components/Bounceable';

const RouteFeed = memo(({ title,  other, navigation })=>{
  
    const [state, setState] = useUpdate({ 
        checked: true,
        content: ''
    });

    const onGetFeeds = (uri)=>{
        fetch(uri).then((res)=>res.text())
        .then(rssParser.parse)
        .then((rss)=>{  
            favicons.uri(uri).then((uris)=>{
                const [icon] = uris
                setState({ info: {
                    name: rss.title,
                    info:rss?.description,
                    icon: icon ||  rss?.image?.url,
                    uri: uri,
                } });  

                Keyboard.dismiss();
            }) 
        });
    }

    const onFeedSave = ()=>{ 
        onGetFeeds(state?.content) 
    }
 
    const onShowFeed = (item)=>{
        return ()=>{ 
            navigation.navigate('Rss', { feed: item }) 
        } 
    }

 
    return (
        <Layout
            title={title}
            renderLeft={(
                <Text color="#f3ca52" onPress={navigation?.goBack}>取消</Text>
            )}
            renderRight={(
                <Text color="#f3ca52" onPress={navigation?.onFeedSave}>完成</Text>
            )}
        >
            <View style={{ padding: 12, gap: 8 }}>
                <View style={{ flexDirection:'row', alignItems:'center',  gap: 12 }}>
                    <Input
                        placeholder="允许输入多个订阅源 以' , ' 分割 "
                        value={state?.content}
                        autoFocus
                        clearButtonMode="always"
                        // selectTextOnFocus={current.init}
                        onChangeText={text=>{  
                            // current.content = text
                            setState({ content: text })
                            
                        }}
                        style={{ flex: 1 }}
                        textInputStyle={{ flex: 1  }}
                        iconStyle={{ backgroundColor:'white',  }}
                    /> 
                    <ButtonCard onPress={onFeedSave}>订阅</ButtonCard>
                </View>

                <View style={{alignItems:'flex-end'}}>
                    <Checkbox 
                        noLine 
                        text="保存到我的收藏" 
                        isChecked={state.checked} 
                        onChange
                        size={16}
                        textStyle={{ fontSize: 12 }} 
                    />
                </View>

                {
                    state?.info?.name && ( 
                        <RNBounceable onPress={onShowFeed(state?.info)} >
                            <WarpCard>
                                <Image source={{ uri: state?.info?.icon }}  style={{ width: 40, height: 40 }}  />
                                <View style={{ flex: 1 }}>
                                    <Text h4 bold numberOfLines={1}>{state?.info?.name}</Text>
                                    <Text t4 numberOfLines={1}>{state?.info?.info}</Text>
                                </View>
                                <Icon icon="chevron-right" size={24} color="#ccc" />
                            </WarpCard> 
                        </RNBounceable> 
                    )
                } 
            </View>
        </Layout>
    )
})


export default RouteFeed