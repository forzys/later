import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { BridgeServer } from 'react-native-http-bridge-refurbished';
import Layout from '@/layout/Layout';
import Card, { ButtonCard } from "@/components/Card";
import QRCode from "@/components/QRCode";
import Text from "@/common/components/Text";
import {auto, assets} from "@/common/common";

const _html = `
<html>
    <body>
        <h1>服务已经启动</h1>
    </body>
</html>
`


function Server() {
    const {current} = useRef({})
    const [start, setStart] = useState(false);
 

    const server = useMemo(()=>{
        const server = new BridgeServer('http_service', true);
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

            console.log({  server })
            server.listen(3000);

            // const server = new BridgeServer('http_service', true);
            // server.get('/', async (req, res) => { 
            //     console.log({ req,  res }) 
            //     return res.html(_html)
            // });
            // server.listen(3000);
            // // http://10.0.2.16:3000 
            // current.server = server
 
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

        return () => {
            server?.stop();
        };
    }, [server]);

    return (
        <Layout>
            <View style={{ justifyContent:'center', gap: 12}}>

                <ButtonCard 
                    onPress={onStartServer}
                    style={{ width: 60, height:60, alignItems:'center', justifyContent:'center', borderRadius:100}}
                >
                    { start ? '已启动' : '启动' }
                </ButtonCard>

                <View style={{ justifyContent:'center', alignItems:'center' }}>
                    {
                        current.ip && start && (
                            <Text color="#bbb">服务已启动， 当前地址 http://{current.ip}:3000</Text>
                        )
                    }

                    {
                        (
                            <View style={{padding: 12, backgroundColor:'#FFF', borderRadius: 6}}> 
                                {/* <QRCode 
                                    size={120} 
                                    value={`https://github.com/rosskhanas/react-qr-code/issues/237`}
                                    fgColor="#dd761c"
                                    logo={{ uri: icon }}
                                    logoSize={30}
                                /> */}

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
                        )
                    } 
                </View>
               
                {/* {lastCalled === undefined
                    ? 'Request webserver to change text'
                    : 'Called at ' + new Date(lastCalled).toLocaleString()} */}
            </View>
            
        </Layout>
    );
}

export default Server;