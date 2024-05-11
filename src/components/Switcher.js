 
import { Text, Animated, TouchableOpacity, StyleSheet  } from "react-native";

export const _buttonContainer = (backgroundColor, alignment) => ({
    width: 85,
    height: 35,
    backgroundColor,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: alignment ? 50 : 0,
    borderBottomLeftRadius: alignment ? 50 : 0,
    borderTopRightRadius: alignment ? 0 : 50,
    borderBottomRightRadius: alignment ? 0 : 50,
});

const styles = StyleSheet.create({
    container: {
        width: "40%",
        height: 35,
        margin: 16,
        borderRadius: 32,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
        justifyContent: "space-evenly",
    },
});
  
const Switcher = ({
    style,
    activeColor = "#FBA928",
    inactiveColor = "#fff",
    primaryTextStyle,
    secondaryTextStyle,
    activeTextColor = "#f1f1f1",
    inactiveTextColor = "#757575",
    primaryText,
    secondaryButtonStyle,
    secondaryText,
    primaryButtonStyle,
    TouchableComponent = TouchableOpacity,
    onPrimaryPress,
    onSecondaryPress,
    ...rest
}) => {
    const [activeTab, setActiveTab] = React.useState(0);
    const [animation, setAnimation] = React.useState(new Animated.Value(1));
    const primaryTextColor = activeTab === 1 ? inactiveTextColor : activeTextColor;

    const springAnimation = () => {
        animation.setValue(0.98);
        Animated.spring(animation, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const setActiveTabColor = (alignment) => {
        if (!alignment) return activeTab === 0 ? inactiveColor : activeColor;
        return activeTab === 1 ? inactiveColor : activeColor;
    };

    const handlePrimaryPress = () => {
        springAnimation();
        setActiveTab(0);
        onPrimaryPress && onPrimaryPress();
    };

    const handleSecondaryPress = () => {
        springAnimation();
        setActiveTab(1);
        onSecondaryPress && onSecondaryPress();
    };

    return (
        <Animated.View style={[styles.container, style, { transform: [{ scale: animation }] }]}>
            <TouchableComponent
                style={[_buttonContainer(setActiveTabColor(true), true), primaryButtonStyle]}
                onPress={handlePrimaryPress}
                {...rest}
            > 
                <Text style={[{ fontWeight: "bold", color:primaryTextColor, }, primaryTextStyle]}>
                    {primaryText}
                </Text>
            </TouchableComponent>

            <TouchableComponent
                onPress={handleSecondaryPress}
                style={[_buttonContainer(setActiveTabColor(false), false), secondaryButtonStyle]}
                {...rest}
            >
                <Text style={[{ fontWeight: "bold", color: activeTab === 0 ? inactiveTextColor : activeTextColor }, secondaryTextStyle]}>
                    {secondaryText}
                </Text>
            </TouchableComponent>
        </Animated.View>
    );
};

export default Switcher;

/**
 * https://github.com/WrathChaos/react-native-duo-toggle-switch
 *  <DuoToggleSwitch
        primaryText="Map"
        secondaryText="List"
        onPrimaryPress={() => {}}
        onSecondaryPress={() => {}}
        TouchableComponent={Ripple}
        rippleColor="#fff"
        rippleContainerBorderRadius={50}
    />
 */