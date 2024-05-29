import { memo, useEffect,useState } from "react";
import { View, Image, ScrollView, ActivityIndicator } from "react-native";
import Loading from "@/components/Loading";
import Card, {ButtonCard, WarpCard} from "@/components/Card";
// import DraggableGrid from "@/components/Draggable";
// import { auto, regex, assets} from '@/common/common'
// import CarouselCard from "@/components/card/carousel";
import Modal from "@/components/Modal";
import Layout from '@/layout/Layout' 
import Segment from "@/components/Segment";
import {useUpdate, useReceive} from "@/hooks/index";
import Icon from "@/common/components/Icon"; 
import Text from "@/common/components/Text";
import Bounceable from "@/common/components/Bounceable";
import configs from "@/common/configs";
import Stagger from "@/common/components/Stagger";
import fetcher from "@/common/fetcher";
import { FadeInDown } from 'react-native-reanimated';

const { width, height } = configs.screen

const RSSFeed = memo(({ navigation })=>{
    const { cache: gCache, onCache } = useReceive()
    const [state, setState, { cache }] = useUpdate({
        data: [
            { key: 1, name: '异次元软件', uri: 'https://feed.iplaysoft.com/', icon: 'https://cdn.iplaysoft.com/ips/icon/favicon-v1/favicon.ico' },
            { key: 2, name: '阮一峰博客', uri: 'https://www.ruanyifeng.com/blog/atom.xml', icon: 'https://www.ruanyifeng.com/favicon.ico' },
            { key: 3, name: '少数派', uri: 'https://sspai.com/feed', icon: 'https://cdn-static.sspai.com/favicon/sspai.ico' },
            { key: 4, name: '月光博客', uri: 'https://www.williamlong.info/rss.xml', icon: 'https://www.williamlong.info/favicon.ico' },
        ],
        showType: gCache.showType,
    });

    const onShowFeed = (item)=>{
        return ()=>{ 
            navigation.navigate('Rss', { feed: item }) 
        } 
    }
    const onSettingFeed = (item)=>{
        return ()=>{ 
            console.log('0000')
            // navigation.navigate('Rss', { feed: item }) 
        } 
    }
    
    const onShowMore = ()=>{
        navigation.navigate('Modal', { name: 'Feeds', title:'更多订阅', remote: true })
    }
 
    const onAddFeed = ()=>{ 
        navigation.navigate('Modal', { name: 'Feeds', title:'新建订阅' })
    }

    const onGetFeed = (filter)=>{
        setState({ loading: true, feeds: [] });

        // system-update 
        fetcher.notion.post('06ceaa8780084fad87c8fbeb41c6e577/query', filter ? { filter: filter } : undefined).then(res=>{
            const Feeds = res.results?.map((obj)=>{
                const { Name, Tags, Url, Icon, Info }= obj?.properties; 
                return {
                    name:Name?.title[0]?.plain_text,
                    uri: Url?.url,
                    icon:Icon?.url,
                    tag: Tags?.multi_select?.name, 
                    info:Info?.rich_text[0]?.plain_text, 
                }
            }); 
            setState({ feeds: Feeds, loading: false });
        })
    }
   
    useEffect(()=>{
        onGetFeed({ property: 'Status', checkbox: { equals: true } });  
    },[]) 


    return (
        <Layout  back freeze={false}>  

            <View style={{ padding: 12 }}>
                <Card onPress={onAddFeed} style={{ width: '100%', padding: 12 }}>
                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 12}}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                            <Icon icon="rss-feed" size={24} color="#ED9455" />
                            <Text>添加订阅源</Text>
                        </View>
                        <Icon icon="chevron-right" size={24} />
                    </View> 
                </Card> 
            </View>

  

            <View style={{ flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', padding:12, }}>
                <View style={{ width:120 }}>
                    <Segment
                        tabs={['全部', '收藏']}
                        width={120}
                        initialIndex={Number(gCache?.showType || 0)}
                        style={{ backgroundColor: '#dfdfdf' }}
                        onChange={e=>{ 
                            onGetFeed(e ? undefined: { property: 'Status', checkbox: { equals: true } })
                         
                        }}
                    /> 
                </View> 

                <Bounceable onPress={onShowMore}>
                    <Text color="#7469b6">更多</Text>
                </Bounceable> 
            </View>
             
            <ScrollView scrollEnabled={!state?.disabled} showsVerticalScrollIndicator={false} style={{ width:'100%',  flex: 1, marginBottom: 24  }} contentContainerStyle={{ minHeight: 400, padding:12, }}>
                {
                    state.loading && (
                        <View style={{ position:'absolute', top: 0, left: 0, right:0, height:400, alignItems:'center', padding: 12, zIndex:2, backgroundColor:'#f1f1f1'  }}>
                            <ActivityIndicator size="large" />
                            <Text>Loading...</Text>
                        </View>
                    )
                }
                <Stagger
                    stagger={50}
                    duration={300}
                    exitDirection={-1}
                    entering={() => FadeInDown.duration(400)}
                    exiting={null}
                    style={{ gap: 12 }}
                >
                    { 
                        state?.feeds?.map(item=>{
                            return (
                                <Card key={item.name} style={{ flex:1 }} onPress={onShowFeed(item)} onLongPress={onSettingFeed(item)}>
                                    <View style={{ paddingVertical: 6, flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 12}}>
                                        <Image source={{ uri: item?.icon }} style={{ width: 25, height: 25 }} />
                                        <View style={{flex: 1}}>
                                            <Text h4>{item.name}</Text>
                                        </View>
                                        <Icon icon="chevron-right" size={24} color="#ccc" />
                                    </View> 
                                </Card>
                            )
                        })
                    }
                </Stagger> 
            </ScrollView> 
    
            <Modal.Confirm 
                title="Confirm Dialog"
                visible={state.dialogVisible}
                onTouchOutside={() => setState({ dialogVisible: false}) }
                positiveButton={{
                    title: "OK",
                    onPress: () =>{
                        setState({ dialogVisible: false})
                    }
                }}
            > 
                <Text>正在实现对单篇文章的收藏保存等操作</Text>
            </Modal.Confirm>
        </Layout>
    )
})


export default RSSFeed