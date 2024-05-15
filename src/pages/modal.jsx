import { memo,useMemo } from "react";
import { View, Text } from "react-native";
import Layout from "@/layout/Layout"; 
import DouyinSheet from "@/pages/modals/douyin"; 
import NotesSheet from "@/pages/modals/notes"; 

 
const RouteEmpty = memo(({ title, navigation })=>{
    return (
        <Layout title={title} rightIcon="close" onRightPress={()=>navigation?.goBack()}>
            <View style={{alignSelf:'center'}}>
                <Text>Empty</Text>
            </View>
        </Layout>
    )
})

export default memo(({ route, navigation  })=>{
    const { title = '', options, name, ...other } = useMemo(()=>{
        return route?.params || {}
    },[route?.params])

    const RouteSheet = useMemo(()=>{
        switch(name){
            case 'Douyin':
                return DouyinSheet; 
            case 'Notes':
                return NotesSheet; 
            default:
                return RouteEmpty;
        }
    },[name])

    return (
        <RouteSheet
            name={name}
            title={title}
            options={options}
            other={other}
            navigation={navigation}
        />
    )
})