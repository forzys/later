import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { BridgeServer } from 'react-native-http-bridge-refurbished';
import Layout from '@/layout/Layout';
import Card, { ButtonCard } from "@/components/Card";
import QRCode from "@/components/QRCode";
import Text from "@/common/components/Text";
import {auto, assets} from "@/common/common";
import configs from "@/common/configs";

const _html = `
<html>
    <body>
        <h1>服务已经启动</h1>
    </body>
</html>
`

const Server = memo(({ route })=>{
    const {current} = useRef({
        allow: true
    })
    const [start, setStart] = useState(false);
  
    const server = useMemo(()=>{
        const server = configs.server ? configs.server : new BridgeServer('http_service', true);
        server.get('/', async (req, res) => { 
            console.log({ req,  res }) 
            return res.html(_html)
        });
        return server
    },[])

    const onStartServer = ()=>{
        try{
            if(start && server){
                server?.stop();
                return setStart(false) 
            }
            server.listen(3000); 
            setStart(true) 
        }catch(e){
            console.log({e})
        } 
    }

    useEffect(() => {
        // 离开页面 关闭服务

        auto.getIp().then((ip)=>{
            current.ip = ip
        })

        auto.getWifi().then((wifi)=>{
            current.wifi = wifi
            console.log({ wifi })
        }).catch(e=>{
            console.log({ e })
        })

        return () => {
            if(current.allow){
                server?.stop();
            }
        };
    }, [server]);

    return (
        <Layout back>
            <View style={{ padding:12, justifyContent:'center', gap: 12 }}>
                <ButtonCard 
                    onPress={onStartServer}
                    style={{ width: 60, height:60, alignItems:'center', justifyContent:'center', borderRadius:100}}
                >
                    { start ? '已启动' : '启动' }
                </ButtonCard>
                {
                    server && start && ( 
                        <View style={{ justifyContent:'center', alignItems:'center' }}> 
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

                            <View style={{marginTop: 24}}>
                                <Text color="#bbb" selectable>服务已启动， 当前地址 http://{current.ip}:3000</Text>
                            </View> 
                        </View> 
                    )
                } 
            </View>
            
        </Layout>
    );
})

export default Server;