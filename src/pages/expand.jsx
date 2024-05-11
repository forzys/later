import { memo, useState } from "react";
import { View, ScrollView } from "react-native";
import { useUpdate } from "../hooks"; 
import Card from "@/components/Card";
import Stagger from "@/common/components/Stagger";
import Text from '@/common/components/Text'
import configs from '@/common/configs'
import Layout from "../layout/Layout";

const screen = configs.screen

const Expand = memo(({ navigation })=>{
    const [config] = useState({
        data: [
            { name:'Fonts', key:'font', title: '更多字体' },
            { name:'Douyin', key:'douyin', title: '抖音解析' },
       
        ]
    });
    const [state, setState] = useUpdate({
        data: config.data,
        scrollEnabled: true 
    });
 
    const goto = (item)=>{
        return ()=>{
            navigation.navigate(item?.name)
        }
        
    }
 
    return (
        <Layout>
            <View style={{alignItems:'center'}}>
                <Text>更多内容正在准备</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 12, gap: 12  }}>
                <Stagger
                    stagger={50}
                    duration={300}
                    exitDirection={-1}
                    style={{ gap: 12, justifyContent: 'center' }}
                > 
                    {
                        state?.data?.map(item=>{
                            return (
                                <Card key={item.key} onPress={goto(item)}>
                                    <View style={{ width: screen.width - 24 * 2 , borderRadius:8, paddingVertical: 8 }} key={item.key}>
                                        <Text>{item.title}</Text>
                                    </View>
                                </Card> 
                            )
                        })
                    }
                </Stagger> 
            </ScrollView> 
        </Layout>
    )
})

export default Expand