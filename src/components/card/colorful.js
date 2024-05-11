 
import { View, Text, Image, StyleSheet } from "react-native";
import RNBounceable from "@/common/components/Bounceable";
import configs from "@/common/configs";

const { width: ScreenWidth } = configs.screen

const styles = StyleSheet.create({
    container: {
      padding: 24,
      borderRadius: 20,
      height: ScreenWidth * 0.48,
      width: ScreenWidth * 0.45,
      backgroundColor: "#FF6863",
    },
    titleTextStyle: {
      fontSize: 15,
      fontWeight: "500",
      color: "rgba(255,255,255,0.7)",
    },
    iconContainerStyle: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 60,
      height: 60,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.3)",
    },
    iconImageStyle: {
      width: 25,
      height: 25,
    },
    contentStyle: {
      marginTop: 32,
      flexDirection: "row",
      alignItems: "flex-end",
    },
    valueTextStyle: {
      color: "#fff",
      fontSize: 28,
      fontWeight: "600",
    },
    valuePostfixTextStyle: {
      fontSize: 18,
      marginLeft: 8,
      color: "#fff",
      fontWeight: "600",
    },
    footerContainerStyle: {
      right: 16,
      bottom: 16,
      position: "absolute",
    },
    footerTextStyle: {
      textAlign: "right",
      color: "rgba(255,255,255,0.9)",
    },
});
 

const ColorfulCard  = ({
    style,
    title,
    value,
    contentStyle,
    valuePostfix,
    iconImageSource,
    iconImageStyle,
    footerTitle,
    footerValue,
    titleTextStyle,
    footerTextStyle,
    valueTextStyle,
    iconContainerStyle,
    valuePostfixTextStyle,
    ImageComponent = Image,
    onPress,
}) => {
    const renderTitle = () => (
        <View>
            <Text style={[styles.titleTextStyle, titleTextStyle]}>{title}</Text>
        </View>
    );

    const renderIconContainer = () => (
        <View style={[styles.iconContainerStyle, iconContainerStyle]}>
            <ImageComponent
                source={iconImageSource}
                style={[styles.iconImageStyle, iconImageStyle]}
            />
        </View>
    );

    const renderContent = () => (
        <View style={[styles.contentStyle, contentStyle]}>
            <Text style={[styles.valueTextStyle, valueTextStyle]}>
                {`${value} `}
                <Text style={[styles.valuePostfixTextStyle, valuePostfixTextStyle]}>
                    {valuePostfix}
                </Text>
            </Text>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerContainerStyle}>
            <Text style={[styles.footerTextStyle, footerTextStyle]}>
                {footerTitle}
            </Text>
            <Text style={[styles.footerTextStyle, footerTextStyle]}>
                {footerValue}
            </Text>
        </View>
    );

    return (
        <RNBounceable style={[styles.container, style]} onPress={onPress}>
            {renderTitle()}
            {renderIconContainer()}
            {renderContent()}
            {renderFooter()}
        </RNBounceable>
    );
};

export default ColorfulCard;