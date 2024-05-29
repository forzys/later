import { memo } from "react";
import { View, Image } from "react-native";
import Loading from '@/components/Loading'
import Layout from "@/layout/Layout"; 
import QRCode from "@/components/QRCode";
import Text from "@/common/components/Text";
import {auto, assets} from "@/common/common";

const Me = memo((props)=>{ 
 
    return (
        <Layout style={{ padding: 12 }}>
            <View style={{flexDirection:'row', gap: 24, alignItems:'center', justifyContent:'center'}}> 
                <View style={{ backgroundColor:'#FFF', width: 120, height: 120, borderRadius: 60, padding: 12, overflow:'hidden' }}>
                    <Image source={{ uri: 'https://avatar.iran.liara.run/public/boy'}} style={{flex: 1}} />
                </View>
                <View style={{padding: 12, backgroundColor:'#FFF', borderRadius: 6}}>  
                    <QRCode
                        value={"https://github.com/rosskhanas/react-qr-code/issues/237"}
                        size={120}
                        dotScale={0.8}
                        dotRadius="50%"
                        positionRadius={["5%", "1%"]}
                        errorCorrection="H"
                        logo={assets.platform.douyin}
                    /> 
                </View>
            </View>

        </Layout>
    )
})


export default Me