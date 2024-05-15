

import { useContext, useRef, useEffect } from 'react'

import { AuthContext, ReceiveContext, ModalContext, FontFaceContext, ThemeContext } from './context'

import useUpdate from './useUpdate'
import useStorage from './useStorage'

export { 
    useUpdate, 
    useStorage,
}


export const useAuth = ()=> useContext(AuthContext)
export const useReceive = ()=> useContext(ReceiveContext)
export const useModal = ()=> useContext(ModalContext)
export const useFontFace = ()=> useContext(FontFaceContext)
export const useTheme = ()=> useContext(ThemeContext) 

// 渲染返回的上一轮渲染时的值
export const usePrevious = (value, init) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    },[value]);

    if (typeof ref.current === "undefined") {
        return init;
    }

    return ref.current;
}

