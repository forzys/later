import { memo, useCallback, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import Header from "@/layout/Header";
import Layout from "@/layout/Layout"; 
import DouyinSheet from "@/pages/modals/douyin"; 


 

const RouteEmpty = memo(()=>{

    return (
        <View>
            <Text>empty</Text>
        </View>
    )
})


export default memo(({ route, navigation  })=>{

    const { title, options, name } = useMemo(()=>{
        return route?.params || {}
    },[route?.params])

    const RouteSheet = useMemo(()=>{
        switch(name){
            case 'douyin':
                return DouyinSheet; 
            default:
                return RouteEmpty;
        }
    },[name])

    return (
        <Layout title={title} rightIcon="close" onRightPress={()=>navigation?.goBack()}>

            <RouteSheet
                options={options}
                name={name}
            />

        </Layout>
    )
})