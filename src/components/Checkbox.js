 
import { forwardRef, useState,  useRef, useCallback, useEffect , useImperativeHandle } from "react";
import { Animated, Pressable, View, StyleSheet } from "react-native";
import RNBounceable from "@/common/components/Bounceable";
import Text from "@/common/components/Text";
import Icon from "@/common/components/Icon";
import useBounce from "@/hooks/useBounce";
 
const AnimationValues = {
    BounceIn: 0.9,
    BounceOut: 1,
    VelocityIn: 0.1,
    VelocityOut: 0.4,
    BouncinessIn: 20,
    BouncinessOut: 20,
  };

function useStateWithCallback(initialState){
    const [state, _setState] = useState(initialState);
    const callbackRef = useRef();
    const isFirstCallbackCall = useRef(true); 
    const setState = useCallback((setStateAction, callback ) => {
        callbackRef.current = callback;
        _setState(setStateAction);
    }, []);

    useEffect(() => {
        if (isFirstCallbackCall.current) {
            isFirstCallbackCall.current = false;
            return;
        }
        callbackRef.current?.(state);
    }, [state]);
  
    return [state, setState];
}

export const RoundedCheckbox = ({
    active,
    isChecked,
    children,
    text = "L",
    textStyle,
    style,
    innerStyle,
    checkedColor = "#0bc8a5",
    uncheckedColor = "#f0f0f0",
    checkedTextColor = "#fdfdfd",
    uncheckedTextColor = "#5c5969",
    onPress,
    size,
    ...rest
}) => {
    const [checked, setChecked] = useStateWithCallback(isChecked || false); 
    const isActive = active || checked;
    const backgroundColor = isActive ? checkedColor : uncheckedColor;
    const textColor = isActive ? checkedTextColor : uncheckedTextColor;

    const handlePress = () => {
        if (typeof active === "boolean"){
            onPress && onPress(active);
        } else{
            setChecked(!checked, (updatedChecked) => {
                onPress && onPress(updatedChecked);
            });
        }
    };

    return (
        <RNBounceable {...rest} style={[styles.outerContainer, size && { width: size * 1.25, height: size * 1.25, borderRadius: size * 1.25 / 2,} ,  style, { borderWidth: isActive ? 1 : 0 }]} onPress={handlePress}>
            <View style={[styles.innerContainer, size && { width: size, height: size, borderRadius: size / 2,} , innerStyle, { backgroundColor }]}>
                {
                    children || ( 
                        <Text style={[styles.textStyle, textStyle, { color: textColor }]}>
                            {text}
                        </Text>
                    )
                }
            </View>
        </RNBounceable>
    );
};

  
const BouncyCheckbox = (props, ref) => {
    const {
        style,
        iconStyle,
        iconComponent,
        iconImageStyle,
        innerIconStyle,
        text,
        textComponent,
        textStyle,
        textContainerStyle,
        testID,
        noLine,
        size = 25,
        onPress,
        onLongPress,
        fillColor = "#ffc484", 
        unFillColor = "transparent",
        disableText = false,
        isChecked = undefined, 
        bounceEffectIn = AnimationValues.BounceIn,
        bounceEffectOut = AnimationValues.BounceOut,
        bounceVelocityIn = AnimationValues.VelocityIn,
        bounceVelocityOut = AnimationValues.VelocityOut,
        bouncinessIn = AnimationValues.BouncinessIn,
        bouncinessOut = AnimationValues.BouncinessOut,
        TouchableComponent = Pressable,
        ...rest
    } = props;

    const [checked, setChecked] = useStateWithCallback(isChecked || false);

    const { bounceAnimation, syntheticBounceAnimation, bounceValue } = useBounce();

    useEffect(() => {
        setChecked(isChecked || false);
    }, [isChecked, setChecked]);

    const onCheckboxPress = useCallback(() => {
        setChecked(!checked, (newCheckedValue) => {
        syntheticBounceAnimation(
            bounceEffectIn,
            bounceEffectOut,
            bounceVelocityOut,
            bouncinessOut,
        );
        onPress && onPress(newCheckedValue);
        });
    }, [
        bounceEffectIn,
        bounceEffectOut,
        bounceVelocityOut,
        bouncinessOut,
        checked,
        onPress,
        setChecked,
        syntheticBounceAnimation,
    ]);

    const onCheckboxLongPress = useCallback(() => {
        if (!onLongPress) {
            return;
        }
        setChecked(!checked, (newCheckedValue) => {
            onLongPress && onLongPress(newCheckedValue);
        });
    }, [checked, onLongPress, setChecked]);

    useImperativeHandle(ref, () => ({ onCheckboxPress, onCheckboxLongPress }), [
        onCheckboxPress,
        onCheckboxLongPress,
    ]);

    const renderCheckIcon = () => {
        const scaleAnimation = { transform: [{ scale: bounceValue }] };
        return (
            <Animated.View
                style={[
                    scaleAnimation,
                    styles.iconContainer(size, checked, fillColor, unFillColor),
                    iconStyle, 
                ]}
            >
                <View style={[styles.innerIconContainer(size, fillColor), innerIconStyle]}>
                    {iconComponent || (checked && (
                        <Icon icon="check" style={[styles.iconStyle, iconImageStyle]} />
                    ))}
                </View>
            </Animated.View>
        );
    };

    const renderCheckboxText = () => {
        const checkDisableTextType = typeof disableText === "undefined";
        return (
            (!disableText || checkDisableTextType) && (textComponent || (
                <View style={[styles.textContainer, textContainerStyle]}>
                    <Text style={[styles.textStyles(checked, noLine), textStyle]}>{text}</Text>
                </View>
            ))
        );
    };

    return (
        <TouchableComponent
            testID={testID}
            style={[styles.row, style]}
            onPressIn={() => {
                bounceAnimation(bounceEffectIn, bounceVelocityIn, bouncinessIn);
            }}
            onPressOut={() => {
                bounceAnimation(bounceEffectOut, bounceVelocityOut, bouncinessOut);
            }}
            onPress={onCheckboxPress}
            onLongPress={onCheckboxLongPress}
            {...rest}
        >
            {renderCheckIcon()}
            {renderCheckboxText()}
        </TouchableComponent>
    );
};
  
const styles = StyleSheet.create({
    row:{
        alignItems: "center",
        flexDirection: "row",
    },
    iconStyle: {
        width: 10,
        height: 10,
    },
    textContainer: {
        marginLeft: 8,
    },
    iconContainer: (size,checked,fillColor,unFillColor) => ({
        width: size,
        height: size,
        borderRadius: 3,
        backgroundColor: checked ? fillColor : unFillColor,
        alignItems: "center",
        justifyContent: "center",
    }),
    innerIconContainer: (size, fillColor) => ({
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: fillColor,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
    }),
    textStyles: (checked, noLine) => ({
        fontSize: 16,
        color: "#757575",
        textDecorationLine: noLine ? 'none' : checked ? "line-through" : "none",
    }),

    outerContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderColor: "#eee",
      alignItems: "center",
      justifyContent: "center",
    },
    innerContainer: {
      width: 40,
      height: 40,
      borderRadius: 40 / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    textStyle: {
      fontSize: 12,
      fontWeight: "bold",
    }, 
});


export default forwardRef(BouncyCheckbox);