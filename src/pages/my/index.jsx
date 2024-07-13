import { memo, useMemo } from "react";
import { View, Image, ScrollView } from "react-native";
import Loading from '@/components/Loading'
import Layout from "@/layout/Layout"; 
import QRCode from "@/components/QRCode";
import Text from "@/common/components/Text";
import {auto, assets} from "@/common/common";
import Icon from "@/common/components/Icon";
import { useAuth, useUpdate } from "@/hooks/index";  
import Card, { ButtonCard, SimpleCard } from "@/components/Card"; 
import RNBounceable from '@/common/components/Bounceable';

 
const FaceButton = memo(({ name,  faces = [], keys, onUseFace })=>{
    return (
        <ScrollView horizontal contentContainerStyle={{ gap: 12 }}>
            {
                faces?.map((face, j)=>{
                    return (
                        <RNBounceable key={name + j} onPress={onUseFace(name, face)}>
                            <View style={{ flexDirection:'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 8, backgroundColor: String(keys) === String(face) ? 'red' : '#FFF' }}>
                                    {
                                        face?.map((txt, t)=>{
                                            return <Text key={name + face + t} bold>{txt}</Text>
                                        })
                                    } 
                            </View>
                        </RNBounceable>
                    )
                })
            }
        </ScrollView>
    )
})
 
const Me = memo((props)=>{
    const { faces = [] } = useAuth();
    const [state, setState] = useUpdate({
        faces: {}, 
        userFace: '',
    });


    const initFace = useMemo(()=>{
        const user = {}
 
        faces?.forEach(i=>{
            user[i.name] = i?.content?.[0]
        }) 
        setState({ faces: user })
        return user['Ears and Arms']?.join( user['Eyes']?.join( String(user['Mouth']) ) ) ||  ''
    },[faces])

  
    const onUseFace = (name, value)=>{

        return ()=>{ 
            const faces = state?.faces
            faces[name] = value 
            const userFace = faces['Ears and Arms']?.join( faces['Eyes']?.join( String(faces['Mouth']) ) ) ||  ''
            setState({ faces, userFace })
        }
        
    }

    return (
        <Layout 
            title=""
            bg="transparent"
            style={{ padding: 12 }}
            leftStyle={{left: 24}} 
            renderLeft={(
                <Text color="#000" h4>我的</Text>
            )}
            renderRight={(
                <View style={{width: 24, height:24  }}>
                    <Icon icon="settings" color="#010101" size={20} /> 
                </View> 
            )} 

            rightComponentStyle={{width: 120}}
        >
            <View style={{flexDirection:'row', gap: 24, alignItems:'center', justifyContent:'center'}}> 
                <View style={{ backgroundColor:'#FFF', width: 120, height: 120, borderRadius: 60, alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                    <Text style={{ fontSize: 24 }} bold>
                        { state.userFace ||  initFace} 
                    </Text>  
                </View>  
            </View> 
            <View style={{flexDirection:'row', gap: 24, alignItems:'center', justifyContent:'center'}}> 
                <View style={{padding: 12, backgroundColor:'#FFF', borderRadius: 6}}>  
                    <QRCode
                        value={"https://github.com/rosskhanas/react-qr-code/issues/237"}
                        size={90}
                        dotScale={0.8}
                        dotRadius="50%"
                        positionRadius={["5%", "1%"]}
                        errorCorrection="H"
                        logo={assets.platform.douyin}
                    /> 
                </View>
            </View> 
            

            <View style={{ gap: 12 }}>
                {
                    faces?.map(item=>{ 
                        return (
                            <View key={item.name}>
                                <Text>{item?.name}</Text>
                                <FaceButton
                                    name={item.name}
                                    keys={state.faces?.[item.name]}
                                    faces={item?.content}
                                    onUseFace={onUseFace}
                                />
                            </View>
                        )
                    })
                } 
            </View>
        </Layout>
    )
})


export default Me