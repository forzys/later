import {  View, Text, Image, StyleSheet, } from "react-native";
import RNBounceable from '@/common/components/Bounceable';

const StateCard = ({
    style, title, onPress, description,
    imageStyle, titleStyle, buttonText,
    shadowStyle, imageSource,
    descriptionStyle, buttonComponent,
    buttonTextStyle, buttonContainerStyle,
    isCenter = true, enableButton = false,
    ...rest
}) => { 
  return (
    <View style={[{ top: 0, }, style]}>
        <Image resizeMode="cover" source={imageSource} style={[styles.imageStyle, imageStyle, isCenter && styles.center]} {...rest} />
        
        <Text style={[isCenter && styles.center, styles.titleStyle, titleStyle]}>
            {title}
        </Text>

        <Text style={[isCenter && styles.center, styles.descriptionStyle,  descriptionStyle ]}>
            {description}
        </Text>

        {
            enableButton && (buttonComponent || (
                <RNBounceable
                    bounceEffect={0.95}
                    {...rest}
                    style={[styles.buttonContainerStyle, buttonContainerStyle]}
                    onPress={onPress}
                >
                    <Text style={[styles.state_buttonTextStyle, buttonTextStyle]}>
                    {buttonText}
                    </Text>
                </RNBounceable>
            )) 
        }
    </View>
  );
}

export default StateCard

const styles =  StyleSheet.create({ 
    center: {
        alignSelf: "center",
        alignContent: "center",
    }, 
    titleStyle: {
        padding: 16,
        fontSize: 32,
        marginTop: 32,
        fontWeight: "bold",
        letterSpacing: 0,
        textAlign: "center",
        color: "#6c64ff",
    }, 
    descriptionStyle: {
        marginLeft: 16,
        marginRight: 16,
        fontSize: 13,
        letterSpacing: 0,
        textAlign: "center",
        color: "#6a758f",
    },
    imageStyle: {
        width: 300,
        height: 200,
    }, 
    buttonContainerStyle: {
        margin: 36,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6c64ff",
    },
    state_buttonTextStyle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
});