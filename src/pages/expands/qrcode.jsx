import { memo, useRef } from "react"
import Layout from "@/layout/Layout"
import { ScrollView, View } from 'react-native';
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'
import Bounceable from '@/common/components/Bounceable'
import {useUpdate, useReceive} from "@/hooks/index";
import Input from "@/components/Input";
import Card, {ButtonCard, WarpCard} from "@/components/Card";
import QRCode from "@/components/QRCode";

import {Received} from "@/components/Progress";

const QR = memo(({ navigation })=>{
    const progressRef = useRef(null);
    const [state, setState] = useUpdate({
        value: ''
    });
 

    const onCreate = ()=>{
        // console.log({ value: state?.value })
        setState({ qrvalue: state?.value })
    }

    return (
        <Layout back> 
            <ScrollView style={{ flex: 1  }} contentContainerStyle={{ padding: 12,gap: 12  }}>
 
                <View style={{ height: 24  }}> 
                    <Bounceable onPress={()=>navigation?.navigate('Modal', { name: 'Qrcode', title:'WIFI 二维码' })}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap:3, position:'absolute', padding:6, right: 0, width: 120, justifyContent:'flex-end' }}>
                            <Icon disabled icon="info-circle" size={12} color="#afafaf" />
                            <Text t4 style={{marginTop: -2}} color="#afafaf">生成 WIFI二维码</Text>
                        </View>
                    </Bounceable>
                </View>

                <View style={{  gap: 12, height: 24 * 4 }}>
                    <Input
                        placeholder="请输入内容"
                        textInputStyle={{ flex: 1, height: 24 * 4, textAlignVertical: 'top'  }}
                        style={{ flex: 1, paddingBottom: 12,  }}
                        maxLength={200}
                        value={state.value}
                        onChangeText={(txt)=>{
                            setState({ value: txt });
                            progressRef.current.setProgress(`${txt.replace(/\n/g,'').length}/200`)
                        }}
                        clearTextOnFocus
                        multiline
                        iconStyle={{ position:'absolute', bottom: 2, right: 3 }}
                        enableIcon={(<Received ref={progressRef} init={'0/200'} style={{ fontSize:12, padding: 2, backgroundColor: 'rgba(236, 238, 245, 0.5)'  }} />)}
                    />
                </View>
                <View style={{flexDirection:'row', gap: 12, alignItems:'center', justifyContent:'flex-end'}}>
                    <Text t4 style={{ textDecorationLine: 'underline', padding: 6 }} onPress={()=>setState({ value: '', qrvalue: '' })}>清除</Text>
                    <ButtonCard style={{ alignSelf: 'flex-end', padding: 6 }} textProps={{t3: true }} disabled={!state?.value?.length}  onPress={onCreate}>生成</ButtonCard> 
                </View>

                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                    {
                        state?.qrvalue && (
                            <View style={{  padding: 12, backgroundColor:'#FFF', borderRadius: 6}}>  
                                <QRCode
                                    value={state.qrvalue}
                                    size={120}
                                    dotScale={0.8}
                                    dotRadius="50%"
                                    positionRadius={["5%", "1%"]}
                                    errorCorrection="H"
                                /> 
                            </View> 
                        )
                    } 
                </View>
            </ScrollView> 
        </Layout>
    )
})

export default QR