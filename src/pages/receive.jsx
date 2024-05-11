import { memo } from "react";
import { View, Text, StatusBar } from "react-native";
import Loading from '@/components/Loading'

const Home = memo((props)=>{


    const onOpen = ()=>{
        Loading.show()
    }



    return (
        <View>
            <StatusBar animated backgroundColor="#000" barStyle="light-content" />
            <Text>
                Receive page
            </Text>
        </View>
    )
})


export default Home