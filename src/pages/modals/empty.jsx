

import { memo } from "react";
import { View, Text } from "react-native";
import Layout from "@/layout/Layout"; 

const RouteEmpty = memo(({ title, navigation })=>{
    return (
        <Layout title={title} rightIcon="close" onRightPress={()=>navigation?.goBack()}>
            <View style={{alignSelf:'center'}}>
                <Text>Empty</Text>
            </View>
        </Layout>
    )
})

export default RouteEmpty