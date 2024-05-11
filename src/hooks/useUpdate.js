import { useState, useRef, useEffect, useMemo } from "react"
import { auto } from '@/common/common'

function useUpdate(init, initFunc){
    const outRef = useRef(null)
    const { current: cache } = useRef({})
    const { current: timer } = useRef({})
    const { current: state } = useRef(init)
    const [, _forceUpdate] = useState([])
 
    const update = (params) => {
        return new Promise((resolve)=>{
            if(typeof params === 'object')
            for(let k in params)
            state[k] = params[k]; 
            _forceUpdate([])
            resolve({...state, ...params })
        })
    }

    const wait = (timeout) => {
        return new Promise(resolve => {
            let waiter = setTimeout(()=>{
                if(timer[waiter]){
                    timer[waiter] = null
                    delete timer[waiter]
                }
                resolve()
            }, timeout);
            timer[waiter] = waiter
        });
    }

    const [uuid] = useMemo(()=>([auto.uuid()]),[])

    useEffect(()=>{
        // 自执行一次
        if(typeof initFunc === 'function'){
            console.log('-------初始化 执行 一次 ---------') 
            initFunc({ 
                state, 
                wait,
                cache, 
                // provider,
                ref: outRef,
                setState: update,  
            })
        }
 
        return ()=> {
            for(let key in Object.keys(timer)){
                timer[key] && 
                clearTimeout(timer[key])
            }
        }
    }, [])
 
    return [state, update, { uuid, cache, timer, wait, ref: outRef }]
}

export default useUpdate
