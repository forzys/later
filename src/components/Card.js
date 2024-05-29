

import React, { Children, memo } from "react";
import { Pressable, View, Image, ImageBackground, StyleSheet, } from "react-native";
import RNBounceable from '@/common/components/Bounceable';
import Text from '@/common/components/Text';
import configs from '@/common/configs'
 

export const WarpCard = memo((props)=>{
    return (
        <View style={StyleSheet.flatten([styles.warp, props?.style])}>
            {props.children}
        </View>
    )
})

const SimpleCard = memo((props)=>{
    return (
        <WarpCard style={StyleSheet.flatten([props?.disabled ? styles.disabled : styles?.action, props.style])}>
            <RNBounceable onLongPress={props?.onLongPress} onPress={props?.onPress} disabled={props?.disabled} style={props?.style}>
                {props.children}
            </RNBounceable> 
        </WarpCard>
    )
})

export const ButtonCard = memo(({ bold = true,  textProps={},  ...props})=>{
    return (
        <SimpleCard onPress={props?.onPress} style={props.style} disabled={props?.disabled}>
            <Text color={props?.color} bold={bold} mt style={props?.disabled ? styles.disabled : styles?.action} {...textProps}>{props?.text || props?.children}</Text>
        </SimpleCard>
    )
})


// https://github.com/WrathChaos/react-native-apple-card-views


const styles =  StyleSheet.create({ 
    // SimpleCard
    warp:{
        flexDirection:'row',
        alignItems:'center', 
        alignSelf:'center', 
        gap: 12, 
        padding: 12, 
        borderRadius: 6,  
        backgroundColor:'#FFF', 
    },  
  
    // carouseCard
    textStyle:{
        fontSize: 18, 
        color: "white", 
        marginLeft: 16,
        fontWeight: "600",
    }, 

    disabled:{
        opacity: 0.65, 
    },
});
 
export default SimpleCard


