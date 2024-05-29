import { memo } from "react";
import Layout from "@/layout/Layout";
import Text from '@/common/components/Text'
import { ScrollView } from "react-native";

export default memo((props)=>{
    return (
        <Layout back >
            <ScrollView style={{flex: 1}} contentContainerStyle={{ padding: 12 }}>
                <Text color="#a1a1a1">正在建设中</Text>
                <Text color="#a1a1a1">将所有解析 & 收藏的视频 以抖音的方式展示</Text>
            </ScrollView>
           
        </Layout>
    )
})