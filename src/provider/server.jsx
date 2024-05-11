import { memo, useRef, useEffect } from "react";
import { BridgeServer } from 'react-native-http-bridge-refurbished';
import { ServerContext } from '@/hooks/context'

const _html = `
<html>
    <body>
        <h1>服务已经启动</h1>
    </body>
</html>
`

export default memo((props)=>{
    const ref = useRef(null)
 
    const start = ()=>{
        const server = new BridgeServer('http_service', true);
   
        server.get('/', async (req, res) => {
            return res.html(_html);
        }).listen(3000); 

        ref.current = server
        // http://10.0.2.16:3000 
    }

    const stop = ()=>{
        ref.current.stop();
    }

    useEffect(() => {
        // 离开页面 关闭服务
        return () => {
            ref.current &&
            ref.current.stop();
        };
    }, []);

    return (
        <ServerContext.Provider value={{ start, stop }}>
            {props.children}
        </ServerContext.Provider>

    )
})