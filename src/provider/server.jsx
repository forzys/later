import { memo, useRef, useEffect, useMemo } from "react";
import { BridgeServer } from 'react-native-http-bridge-refurbished';
import { ServerContext } from '@/hooks/context'
import { auto } from '@/common/common'
import { useUpdate } from "../hooks";

const _html = `
<html>
    <body>
        <h1>服务已经启动</h1>
    </body>
</html>
`

export default memo((props)=>{
    const { current } = useRef({});
    const [state, setState] = useUpdate({})

    const server = useMemo(()=>{
        const server = new BridgeServer('http_service', true)
        server.get('/', async (req, res) => res.html(_html))
        return server
    },[]);
  
    const start = (port = 3000)=>{
        if(current.starting){
            server.stop();
        }
        server.listen(port);
        current.starting = true
    } 

    const stop = ()=>{
        server.stop();
        current.starting = false
    }

    const id = '4e5c1f3f548e4015b8182946d684c8e5'

    // const query = (id, q)=>{
    //     return fetcher.notion.post(id + '/query', { filter: q })
    // }

    useEffect(() => {
        // 离开页面 关闭服务
        auto.getIp().then((ip)=>{
            current.ip = ip
        })

        return () => {
            server.stop();
        };
    }, []);

    return (
        <ServerContext.Provider value={{ start, stop,  server,  ...current }}>
            {props.children}
        </ServerContext.Provider>

    )
})