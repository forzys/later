import { memo, useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import Card from "@/components/Card"; 
import Layout from '@/layout/Layout'  
import {useUpdate} from "@/hooks/index";
import Icon from "@/common/components/Icon"; 
import Text from "@/common/components/Text"; 
import configs from "@/common/configs";
import Stagger from "@/common/components/Stagger";
import fetcher from "@/common/fetcher";
import { FadeInDown } from 'react-native-reanimated';

const Summary = memo(({ navigation })=>{
    const [state, setState] = useUpdate({})
      
    const onShowSummary = (item)=>{
        return ()=>{ 
            navigation.navigate('Render', { uri: item.href, title: item.title?.slice(2)  }) 
        } 
    }

    const onGetSummary = ()=>{
        setState({ loading: true }); 
        fetcher.notion.post('7f0fad12721548baaaab84da9068d211/query',{ 
            filter: {  property: 'Status',  checkbox: { equals: true }}
        }).then(async res=>{ 
            const info = {} 
            for(let obj of res.results){
                const { File, Time } = obj.properties; 
                const date = Time.date.start
                const url = File?.files[0]?.file?.url; 
                const content = await fetch(url).then((res)=>res.json()) 
                info.time = date
                info.summary = content 
            } 
            setState({ ...info, loading: false }); 
        })
    }
   
    useEffect(()=>{
        onGetSummary();  
    },[]) 


    return (
        <Layout back freeze={false}>  
             
            <View style={{ flex: 1, width:'100%', alignItems:'center' }}>
                <ScrollView scrollEnabled={!state?.disabled} style={{ width:'100%',  flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                    <Stagger
                        stagger={50}
                        duration={300}
                        exitDirection={-1}
                        loading={state?.loading ? ()=>{
                            return (
                                <View style={{alignItems:'center'}}>
                                    <ActivityIndicator size="large" />
                                    <Text>Loading...</Text>
                                </View>
                            )
                        }: undefined}
                        entering={() => FadeInDown.duration(400)}
                        style={{ gap: 12 }}
                    >
                        {
                            state.summary?.map(item=>{
                                return (
                                    <Card key={item?.title?.trim()?.slice(0,2)} style={{flex:1}} onPress={onShowSummary(item)}>
                                        <View style={{ padding: 6,  gap: 6}}>
                                           
                                            <View style={{flex: 1 }}>
                                                <Text h4>{item.title}</Text>
                                            </View>

                                            <View style={{ width: 80, flexDirection:'row', alignItems:'center', justifyContent:'flex-end', alignSelf:'flex-end'}}>
                                                <Icon icon="content-view" size={18} style={{alignSelf:'flex-end'}} />
                                                <Text t4>原网页</Text>
                                            </View> 
                                        </View> 
                                    </Card>
                                )
                            }) 
                        } 
                    </Stagger>
                </ScrollView> 
            </View>
 
        </Layout>
    )
})


export default Summary