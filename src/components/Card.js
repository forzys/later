

import React, { Children, memo } from "react";
import { Pressable, View, Image, ImageBackground, StyleSheet, } from "react-native";
import RNBounceable from '@/common/components/Bounceable';
import Text from '@/common/components/Text';
import configs from '@/common/configs'

const { width, height } = configs.screen
 
const SimpleCard = memo((props)=>{
    return (
        <View style={[styles.warp, props?.disabled ? styles.disabled : styles.action, props.style]}>
            <RNBounceable onPress={props?.onPress} style={props.style}>
                {props.children}
            </RNBounceable> 
        </View>
    )
})

export const ButtonCard = memo((props)=>{
    return (
        <SimpleCard onPress={props?.onPress} style={props.style}>
            <Text color={props?.color} bold style={{ marginTop:-3 }}>{props?.text || props?.children}</Text>
        </SimpleCard>
    )
})

export const CarouselCard = ({ style,  text, source, width, height,  textStyle, ...props}) => {
    const {  
        shadowColor, shadowStyle, borderRadius, overlayHeight, shadowPaddingBottom,
        backgroundColor, borderBottomLeftRadius, borderBottomRightRadius 
    } = props;

    return (
        <ImageBackground
            source={source}
            borderRadius={borderRadius}
            style={[
                {
                    width,
                    height,
                    paddingBottom: shadowPaddingBottom 
                },
                shadowStyle || {
                    shadowColor,
                    shadowOffset: {
                        width: 0,
                        height: 7
                      },
                      shadowOpacity: 0.43,
                      shadowRadius: 9.51
                },
                style,
            ]}
        >
            <View 
                style={[
                    { bottom: 0, position: "absolute", justifyContent: "center" },
                    {
                        width, height:overlayHeight,
                        backgroundColor,
                        borderBottomLeftRadius,
                        borderBottomRightRadius,
                    }
                ]}
            >
                <Text style={textStyle || styles.textStyle}>{text}</Text>
            </View>
        </ImageBackground>
    );
};
 
CarouselCard.defaultProps = {
    text: "California Festive 2020",
    width: 300,
    height: 300,
    borderRadius: 16,
    overlayHeight: 50,
    shadowColor: "#000",
    shadowPaddingBottom: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    source: {
        uri:
          "https://images.unsplash.com/photo-1471306224500-6d0d218be372?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
      }
};

// https://github.com/WrathChaos/react-native-apple-card-views


const styles =  StyleSheet.create({ 
    // SimpleCard
    warp:{ 
        flexDirection:'row',
        alignItems:'center', 
        alignSelf:'center', 
        gap: 12, 
        padding: 12,
        // paddingHorizontal: 12,
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
 
});
 
export default SimpleCard


