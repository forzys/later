import React, { Children, memo } from "react";
import { Pressable, View, Image, ImageBackground, StyleSheet, } from "react-native";
import RNBounceable from '@/common/components/Bounceable';
import Text from '@/common/components/Text';
import configs from '@/common/configs'


const CarouselCard = ({ style,  text, source, width, height,  textStyle, ...props}) => {
    const {  
        shadowColor, shadowStyle, borderRadius, overlayHeight, shadowPaddingBottom,
        backgroundColor, borderBottomLeftRadius, borderBottomRightRadius 
    } = props;

    return (
        <ImageBackground
            source={source}
            borderRadius={borderRadius}
            resizeMode="contain"
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
                <Text style={StyleSheet.flatten([styles.textStyle, textStyle])}>{text}</Text>
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

export default CarouselCard

const styles =  StyleSheet.create({  
    // carouseCard
    textStyle:{
        fontSize: 18, 
        color: "white", 
        marginLeft: 16,
        fontWeight: "600",
    }, 

    disabled:{
        opacity: 0.75,
    }
});