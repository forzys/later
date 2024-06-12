import React from "react";
import { TextInput, StyleSheet, Animated,   Image, TouchableOpacity, Text, View } from "react-native";
import configs from "@/common/configs";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const defaults = {
    MAIN_COLOR : "#2a41cb",
    ORIGINAL_COLOR : "transparent",
    PLACEHOLDER_COLOR : "#757575",
    ORIGINAL_VALUE :1,
    ANIMATED_VALUE :1,
}

const _textInputStyle = (borderColor) => ({
    height: 50,
    minWidth: configs.screen.width * 0.5,
    borderWidth: 1,
    paddingLeft: 16,
    borderRadius: 8,
    paddingRight: 16,
    borderColor: borderColor,
    justifyContent: "center",
    backgroundColor: "#eceef5",
    color: "#000",
});

const styles = StyleSheet.create({
    searchBoxGlue: {
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 3,
        height: 25,
    },
    searchBoxTextStyle: {
        left: 5,
        width: "85%",
        fontSize: 12,
        color: "#90A2BD",
    },
    searchImageStyle: {
        width: 15,
        height: 15,
        tintColor: "#aaa",
    },


    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainerStyle: {
        right: 16,
        position: "absolute",
    },
    iconImageStyle: {
        height: 20,
        width: 20,
        tintColor: "#b5b9bb",
    },
});
  

export const SearchBox = ({
    searchBoxText = "What are you looking for?",
    iconComponent,
    onSearchBoxPress,
    searchBoxWidth = "55%",
    disableTextInput = false,
    searchBoxBorderRadius = 20,
    searchBoxBackgroundColor = "#F5F7FA",
    ...rest
}) => {
    return (
        <TouchableOpacity
            style={{
                left: 8,
                padding: 6,
                width: searchBoxWidth,
                borderRadius: searchBoxBorderRadius,
                backgroundColor: searchBoxBackgroundColor,
            }}
            onPress={onSearchBoxPress}
        >
            <View style={styles.searchBoxGlue}>
                {iconComponent || (iconComponent
                //   <Image
                //     resizeMode="contain"
                //     source={require("../../local-assets/search.png")}
                //     style={styles.searchImageStyle}
                //   />
                )}
                {
                    disableTextInput ? (
                        <Text style={styles.searchBoxTextStyle}>{searchBoxText}</Text> 
                    ) : (
                        <TextInput placeholder={searchBoxText} style={styles.searchBoxTextStyle} {...rest} />
                    )
                } 
            </View>
        </TouchableOpacity>
    )
};


export default class InteractiveTextInput extends React.Component{
    constructor(props) {
        super(props);
        this.interpolatedColor = new Animated.Value(defaults.ORIGINAL_VALUE);
        this.state = {};
    }

    showOriginColor = () => {
        Animated.timing(this.interpolatedColor, {
            duration: 350,
            toValue: defaults.ORIGINAL_VALUE,
            useNativeDriver: false,
        }).start();
    };

    showFocusColor = () => {
        Animated.timing(this.interpolatedColor, {
            duration: 450,
            toValue: defaults.ANIMATED_VALUE,
            useNativeDriver: false,
        }).start();
    };
 
    renderIcon = () => {
        const { 
            enableIcon, 
            iconStyle, 
            onIconPress, 
            IconComponent = TouchableOpacity,
        } = this.props;
 
        return (
            enableIcon && (
                <IconComponent
                    style={[styles.iconContainerStyle, iconStyle]}
                    onPress={onIconPress}
                >
                    {enableIcon} 
                </IconComponent>
            )
        );
    };

    renderAnimatedTextInput = () => {
        const mainColor = this.props.mainColor ||defaults.MAIN_COLOR;
        const originalColor = this.props.originalColor || defaults.ORIGINAL_COLOR;
        const animatedPlaceholderTextColor =
        this.props.animatedPlaceholderTextColor || defaults.PLACEHOLDER_COLOR;

        let borderColor = this.interpolatedColor.interpolate({
            inputRange: [defaults.ORIGINAL_VALUE, defaults.ANIMATED_VALUE],
            outputRange: [originalColor, mainColor],
        });
        let placeholderTextColor = this.interpolatedColor.interpolate({
            inputRange: [defaults.ORIGINAL_VALUE, defaults.ANIMATED_VALUE],
            outputRange: [animatedPlaceholderTextColor, mainColor],
        });
        return (
            <AnimatedTextInput
                placeholderTextColor={placeholderTextColor}
                placeholder="请输入..."
                {...this.props}
                style={[_textInputStyle(borderColor), this.props.textInputStyle]}
                onFocus={() => {
                    this.showFocusColor();
                    this.props.onFocus && this.props.onFocus();
                }}
                onBlur={() => {
                    this.showOriginColor();
                    this.props.onBlur && this.props.onBlur();
                }}
            />
        );
    };

    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                {this.renderAnimatedTextInput()}
                {this.renderIcon()}
            </View>
        );
    }
}