import { memo, useCallback, useMemo } from "react";
import { View, ScrollView } from "react-native";
 
import Text from '@/common/components/Text' 
import Card from "@/components/Card";  

const RouteDouyin = memo((props)=>{
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ width:'100%', flex: 1, paddingHorizontal: 12 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap:12, }}>
                {
                    props?.options?.map(item=>{
                        return (
                            <Card key={item?.key} style={{ width:'100%' }} >
                                <View style={{ width:'100%', flex: 1, gap: 6 }}>
                                    <Text t4> {item.timetamp}</Text>
                                    <Text numberOfLines={2}>{item.title || item?.origin}</Text>
                                    <Text t4 style={{alignSelf:'flex-end'}}> {item.video ? '已下载': '未下载'}</Text>
                                </View>
                            </Card> 
                        )
                    })
                }
            </ScrollView>
        </View>
    )
})


export default RouteDouyin