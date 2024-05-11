import { createContext } from 'react'

export const AuthContext = createContext({
    _name: 'auth'
})

export const ModalContext = createContext({
    _name: 'modal'
});

export const ReceiveContext = createContext({
    _name: 'receive'
})

export const FontFaceContext = createContext({
    _name: 'font',
    onFontChange:()=>null
})

export const ServerContext = createContext({
    _name: 'server',
})

export const ThemeContext = createContext({
    _name: 'theme',
})