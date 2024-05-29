import React, { memo, useRef, useEffect, useMemo } from 'react';
import { ScrollView, View , ActivityIndicator, Pressable, Image, Alert } from 'react-native'; 
import Layout from '@/layout/Layout';
import Card, { WarpCard } from "@/components/Card"; 
import Text from "@/common/components/Text";
import Icon from "@/common/components/Icon";
import configs from "@/common/configs";
import {useUpdate, useFontFace} from "@/hooks/index";
import rssParser from '@/common/lib/rssParser'
import RenderHtml from 'react-native-render-html';
import Sheet from "@/components/Sheet"; 
import Segment from "@/components/Segment";
import { auto } from '@/common/common';
import Checkbox from "@/components/Checkbox";
import Modal from "@/components/Modal";
import { ButtonCard } from '../../components/Card';

const { width } = configs.screen

const XMLRSS = memo(({ navigation, route })=>{
    const sheetRef = useRef(null);

    const [state, setState, { cache }] = useUpdate({ 
        loading: true, 
        settings:[
            {
                title: { h5: true, bold:true, color: "#3f3f3f" },
                p:{ fontSize: 12 },
                btn:{ t5: true },
            },
            {
                title: { h4: true, bold:true, color: "#3f3f3f" },
                p:{ fontSize: 14 },
                btn:{ t4: true },
            },
            {
                title: { h3: true, bold:true, color: "#3f3f3f" },
                p:{ fontSize: 16 },
                btn:{ t3: true },
            },
        ], 
        setting:{
            title: { h4: true, bold:true, color: "#3f3f3f" },
            p:{ fontSize: 14 },
        }
    })
    const { fontName = 'Roboto'  } = useFontFace()

    const { feed } = useMemo(()=>{
        return route?.params || {}
    },[route?.params])

    const onGetFeeds = (uri)=>{ 
        fetch(uri).then((res)=>res.text())
        .then(rssParser.parse)
        .then((rss)=>{
            setState({ 
                updated: auto.dateFormat(rss.lastUpdated).format('YYYY-MM-DD'),
                feed: rss,
                loading: false 
            });
        });
    }

    useEffect(()=>{
        if(feed?.uri && (feed?.uri !== cache.uri)){
            cache.uri = feed.uri
            onGetFeeds(feed.uri)
        }
    },[feed.uri]) 

    const onShow = (item)=>{
        return ()=>{
            const [first] = item?.links
            navigation.navigate('Render',{ uri: first?.url, title: item.title })
        }
    } 


    return (
        <Layout
            title={feed?.name}  
            renderRight={(
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 18, paddingHorizontal:6  }}>
                    <Icon icon="info-circle" color="#a1a1a1" size={18} onPress={sheetRef?.current?.open}  />
                    <Icon icon="chevron-bottom" color="#a1a1a1" size={20} onPress={navigation.goBack}  />
                </View>
            )}
        >
            <View style={{ justifyContent:'center', gap: 12  }}>
                {
                    state?.loading ? (
                        <View style={{ width: '100%', padding: 24, alignItems:'center', justifyContent:'center' }}>
                            <ActivityIndicator size="large" />
                            <Text>数据正在加载</Text>
                        </View>
                    ): (
                        <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
                            {
                                state?.feed?.items?.map((item, index)=>{
                                    return ( 
                                        <WarpCard key={index} style={{ flex: 1, width: '100%' }}> 
                                            <View style={{ gap: 8, flex: 1,}}>
                                                <Text {...state?.setting?.title} color="#3f3f3f" numberOLines={2} selectable>{item?.title?.trim()}</Text>
                                            
                                                <RenderHtml
                                                    ignoredDomTags={['iframe','br', 'font', 'style', 'img', 'audio', 'video']}
                                                    contentWidth={width - 24}
                                                    source={{ html: item?.description }}
                                                    tagsStyles={{ p: state?.setting?.p, img:{ display:'block', overflow:'hidden', maxWidth: '100%', objectFit:'cover', height: 'auto' }, div:{ overflow:'hidden'  } }}
                                                    defaultTextProps={{ selectable: true, style:{ fontFamily: fontName, ...state?.setting?.p } }}
                                                    renderersProps = {{ a: { onPress: onShow(item) } }}
                                                /> 
                                            
                                                <View style={{ flexDirection:'row', gap: 8, alignItems:'center', justifyContent:'space-between' }}>

                                                    <View>
                                                        <Text {...state?.setting?.btn} color={item.updated ? "#aaa" : "#afafaf"}>{item.updated ? '已读': '未读'}</Text> 
                                                    </View>
                                                    
                                                    <View style={{ flexDirection:'row', gap: 12, alignItems:'center', justifyContent:'flex-end' }}>
                                                        <Pressable style={{ flexDirection:'row', alignItems:'center', gap: 1 }} onPress={()=> setState({ visible: true })}>
                                                            <Icon icon="folder" size={16} color="#AF8F6F" />
                                                            {/* <Text {...state?.setting?.btn} color="#AF8F6F">收藏</Text> */}
                                                        </Pressable>

                                                        <Pressable style={{ flexDirection:'row', alignItems:'center', gap: 1 }} onPress={onShow(item)}>
                                                            <Icon icon="content-view" size={18} color="#ED9455" />
                                                            <Text {...state?.setting?.btn} color="#ED9455">原网页</Text>
                                                        </Pressable> 
                                                    </View> 
                                                </View>
                                            
                                            </View> 
                                        </WarpCard>
                                    )
                                })
                            }
                        </ScrollView>
                    )
                }
            </View> 
 
            <Sheet ref={sheetRef} style={{ paddingHorizontal: 12 }}> 
                <View style={{ gap: 12 }}> 
                    <WarpCard style={{ width:'100%', gap: 6, flexWrap:'wrap'}}>
                        <Image source={{ uri: feed?.icon }}  style={{ width: 40, height: 40 }}  />
                        <View style={{ flex: 1 }}>
                            <Text h4 bold numberOfLines={1}>{feed?.name}</Text>
                            <Text t4 numberOfLines={1}>{feed?.info}</Text> 
                            <Text numberOfLines={1} t4 selectable>{feed.uri}</Text>
                        </View>
                        <Icon icon="rss-feed" size={24} color="#ED9455" />
                    </WarpCard>

                    <View style={{ paddingHorizontal: 6, gap: 12 }}>
 
                        <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                            <Text>收藏：</Text>
                            <Checkbox 
                                noLine
                                isChecked={state.checked} 
                                onPress={()=> setState({  checked: !state?.checked })}
                                size={16} 
                            />
                        </View>



                        <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                            <Text>显示：</Text>
                            <Segment
                                tabs={['全部', '未读', '已读']}
                                width={160}
                                initialIndex={0}
                                textStyle={{fontSize: 13 }}
                                style={{ backgroundColor: '#dfdfdf', alignItems:'center' }}
                                onChange={e=>{ }}
                            /> 
                        </View>

                        <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                            <Text>字体：</Text>
                            <Segment
                                tabs={['小', '中', '大']}
                                width={120}
                                initialIndex={1}
                                textStyle={{fontSize: 13 }}
                                style={{ backgroundColor: '#dfdfdf', alignItems:'center' }}
                                onChange={e=>{
                                    setState({ setting: state?.settings[e] })
                                 }}
                            /> 
                        </View>
                        

                        <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                            <Text>最近更新：</Text>
                            <Text>{state?.updated}</Text>
                        </View>
                       
                    </View>
                </View> 
            </Sheet> 

            <Modal
                visible={state.visible}
                onTouchOutside={() => setState({ visible: false }) }
                buttons={(
                    <ButtonCard onPress={() => setState({ visible: false }) }>
                        OK
                    </ButtonCard>
                )}
            > 
                <Text>正在实现对单篇文章的收藏保存等操作</Text>
            </Modal> 
        </Layout>
    );
})

export default XMLRSS;