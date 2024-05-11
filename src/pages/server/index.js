import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { BridgeServer } from 'react-native-http-bridge-refurbished';


const _html = `
<html>
    <body>
        <h1>服务已经启动</h1>
    </body>
</html>
`
 


function Server() {
    const ref = useRef(null)
    const [start, setState] = useState(false);
 
    const onServerStart = ()=>{
        const server = new BridgeServer('http_service', true);
   
        server.get('/', async (req, res) => { 
            console.log({ req,  res }) 
            return res.html(_html)
            // or res.json({message: 'OK'});
        }); 

        server.listen(3000);
        // http://10.0.2.16:3000 
        ref.current = server 
    }
 

    useEffect(() => {
        // 离开页面 关闭服务
        return () => {
            ref?.current?.stop();
        };
    }, []);




    return (
        <Text>
            {lastCalled === undefined
                ? 'Request webserver to change text'
                : 'Called at ' + new Date(lastCalled).toLocaleString()}
        </Text>
    );
}

export default Server;