

import { memo, useState } from "react";
import { View } from "react-native";
import Layout from "@/layout/Layout"; 
import Icon from "@/common/components/Icon";
import Text from "@/common/components/Text";
import Input from "@/components/Input";
import Card, {ButtonCard, WarpCard} from "@/components/Card";
import QRCode from "@/components/QRCode";
import Segment from "@/components/Segment";
 
const RouteQrcode = memo(({ title, navigation })=>{
    // const [name, setName] = useState('')
    // const [password, setPassword] = useState('')
    const [qrvalue, setQrvalue] = useState('')
    const [settings, setSetting] = useState({
        mode: 'WPA',
        modes: ['无', 'WEP', 'WPA2/3'],
        modeIndex: 2,
        modeValue:['nopass', 'WEP', 'WPA'],

        ssid: '',
        password: ''
    })
 
    const escape = (v) => {
        const needsEscape = ['"', ';', ',', ':', '\\'];
        let escaped = '';
        for (const c of v) {
            needsEscape.includes(c) 
            ? (escaped += `\\${c}`) 
            : (escaped += c)
        }
        return escaped;
    };
     
    const onCreate = ()=>{
        // WIFI:T:WPA;S:HomeNetwork;P:password1234;;
        let opts = {}; 
        opts.T = settings.mode || 'nopass';
        opts.S = escape(settings.ssid);
        opts.P = escape(settings.password);
        let data = '';
        Object.entries(opts).forEach(([k, v]) => (data += `${k}:${v};`));
        const qrval = `WIFI:${data};`;
    
        setQrvalue(qrval); 
    }
 

    return (
        <Layout 
            title={title} 
            rightIcon="close" 
            renderLeft={(<Text style={{paddingHorizontal: 12}} onPress={navigation.goBack}>取消</Text>)}
            onRightPress={()=>navigation?.goBack()}
        >
            <View style={{ gap: 12, flex: 1, paddingVertical: 24, paddingHorizontal: 12  }}>
                <View style={{ width:'100%', height: 50, flexDirection:'row', gap: 12  }}>
                    <WarpCard>
                        <Icon icon="wifi" size={18} />
                    </WarpCard>
                    <Input 
                        placeholder="请输入WiFi名称"
                        textInputStyle={{ flex: 1   }}
                        style={{ flex: 1 }}
                        value={settings?.ssid}
                        onChangeText={txt=>setSetting({ ...settings, ssid: txt})}
                        enableIcon={(<Icon icon="circle-close" size={16} color="#ccc" onPress={e=>settings.ssid && setSetting({ ...settings, ssid: '' })} />)}
                    />
                </View>

                <View style={{width:'100%', height: 50, flexDirection:'row', gap: 12  }}>
                    <WarpCard>
                        <Icon icon="wifi-password" size={18} />
                    </WarpCard>
                    <Input
                        placeholder="请输入WiFi密码"
                        textInputStyle={{ flex: 1   }}
                        style={{ flex: 1 }} 
                        value={settings?.password} 
                        onChangeText={txt=>setSetting({ ...settings, password: txt })} 
                        enableIcon={(<Icon icon="circle-close" size={16} color="#ccc" onPress={e=>settings.password && setSetting({ ...settings, password: '' })} />)}
                    /> 
                </View> 

                <View style={{width:'100%', height: 50, flexDirection:'row', gap: 12  }}>
                    <WarpCard>
                        <Icon icon="settings-adjust" size={18} />
                    </WarpCard>

                    <Segment
                        tabs={settings?.modes}
                        width={220}
                        initialIndex={Number(settings?.modeIndex || 0)}
                        style={{ backgroundColor: '#dfdfdf', marginVertical: 4 }}
                        onChange={index=>{
                            setSetting({
                                ...settings, 
                                ssid: '',
                                password: '',
                                modeIndex: index, 
                                mode: settings?.modeValue[index] 
                            })
                        }}
                    /> 
                </View> 

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                    <Text t4>生成wifi二维码 扫码直接连wifi</Text>
                    <ButtonCard style={{ alignSelf: 'flex-end'}} disabled={settings?.password?.length < 8} onPress={onCreate}>生成</ButtonCard>
                </View>

                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                    {
                        qrvalue && (
                            <View style={{  padding: 12, backgroundColor:'#FFF', borderRadius: 6}}>  
                                <QRCode
                                    value={qrvalue}
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
            </View>
        </Layout>
    )
})

export default RouteQrcode