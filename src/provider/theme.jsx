import { memo, useRef, useEffect, useState, useMemo } from "react";
import { ThemeContext } from '@/hooks/context'

export default memo((props)=>{
    const ref = useRef(null);

    const [active, setActive] = useState('light')

    const [themes, setState] = useState({
        dark:{
        },
        light:{
            barBg: '#FFF',
            background:'#F1F1F1',
            transparent: 'transparent', 
        },
    });


    const [theme] = useMemo(()=>{
        return [ 
            themes[active] 
        ]
    },[themes.dark, theme.light, active])

    useEffect(() => {
        return () => {

        };
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: theme }}>
            {props.children}
        </ThemeContext.Provider>

    )
})