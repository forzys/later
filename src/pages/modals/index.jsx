import { memo,useMemo } from "react";

import DouyinSheet from "@/pages/modals/douyin"; 
import NotesSheet from "@/pages/modals/notes"; 
import FeedsSheet from "@/pages/modals/feeds"; 
import EmptySheet from "@/pages/modals/empty"; 

import { View, ScrollView, Button } from "react-native";
import Text from '@/common/components/Text' 


export default memo(({ route, navigation  })=>{
    const { title = '', options, name, ...other } = useMemo(()=>{
        return route?.params || {}
    },[route?.params])

    const RouteSheet = useMemo(()=>{
        switch(name){
            case 'Douyin':
                return DouyinSheet; 
            case 'Notes':
                return NotesSheet; 
            case 'Feeds':
                return FeedsSheet; 
            default:
                return EmptySheet;
        }
    },[name])

    return (
        <RouteSheet
            name={name} 
            title={title}
            options={options}
            other={other}
            navigation={navigation}
        />
    )
})