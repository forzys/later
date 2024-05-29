import { Component, cloneElement } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import Touchable from './Touchable'
 
const sharpEasingValues = {
    entry: Easing.bezier(0.0, 0.0, 0.2, 1),
    exit: Easing.bezier(0.4, 0.0, 0.6, 1),
};

const noop = () => {};

const durationValues = {
    entry: 225,
    exit: 195,
};

const moveEasingValues = {
    entry: Easing.bezier(0.0, 0.0, 0.2, 1),
    exit: Easing.bezier(0.4, 0.0, 1, 1),
};

const styles = StyleSheet.create({
    addButton: {
        borderRadius: 50,
        alignItems: 'stretch',
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0,
        },
        elevation: 2,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 17,
        right: 17,
        height: 62,
        width: 62,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    addButtonInnerContainer: {
        flex: 1,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default class FAB extends Component {
    static defaultProps = {
        buttonColor: 'red',
        iconTextColor: '#FFFFFF',
        onClickAction: noop,
        iconTextComponent: <Text>+</Text>,
        visible: true,
        snackOffset: 0,
        style: {},
        bottom: 20,
    };

    state = {
        translateValue: new Animated.Value(0),
        shiftValue: new Animated.Value(0),
    };

    componentDidMount() {
        const { translateValue, shiftValue } = this.state;
        const { visible, snackOffset, bottom } = this.props;

        if (visible) {
            translateValue.setValue(1);
        } else {
            translateValue.setValue(0); 
        }
        if (snackOffset === 0) {
            shiftValue.setValue(bottom);
        } else {
            shiftValue.setValue(bottom + snackOffset);
        }
    }

 
    UNSAFE_componentWillReceiveProps(nextProps) {
        const { translateValue, shiftValue } = this.state;
        const { visible, snackOffset, bottom } = this.props;

        if (nextProps.visible && !visible) {
            Animated.timing(translateValue, {
                duration: durationValues.entry,
                toValue: 1,
                easing: sharpEasingValues.entry,
                useNativeDriver: false,
            }).start();
        } else if (!nextProps.visible && visible) {
            Animated.timing(translateValue,{
                duration: durationValues.exit,
                toValue: 0,
                easing: sharpEasingValues.exit,
                useNativeDriver: false,
            }).start();
        }
        if (nextProps.snackOffset !== snackOffset) {
            if (nextProps.snackOffset === 0) {
                Animated.timing(shiftValue,{
                    duration: durationValues.exit,
                    toValue: bottom,
                    easing: moveEasingValues.exit,
                    useNativeDriver: false,
                }).start(); 
            } else if (nextProps.snackOffset !== 0) {
                Animated.timing(shiftValue,{
                    duration: durationValues.entry,
                    toValue: bottom + nextProps.snackOffset,
                    easing: moveEasingValues.entry,
                    useNativeDriver: false,
                }).start();
            }
        }
    }

    render() {
        const { translateValue, shiftValue } = this.state;
        const { radius, onClickAction, buttonColor, iconTextComponent, iconTextColor, fabStyle, style, size = 62, position, children } = this.props;

        const dimensionInterpolate = translateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, size / 1.2],
        });

        const rotateInterpolate = translateValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg'],
        });

        return (
            <Animated.View style={[styles.fabContainer, size && { width:size, height:size, }, position && { ...position }, radius && {borderRadius: radius },  { bottom: shiftValue }]}>
                <Animated.View
                    style={[
                        styles.addButton, {
                            height: dimensionInterpolate,
                            width: dimensionInterpolate,
                        },
                        radius && { borderRadius: radius },  
                        fabStyle,
                    ]}
                >
                    <Touchable
                        onPress={onClickAction}
                        style={[styles.addButtonInnerContainer, style, radius && { borderRadius: radius }]}
                        buttonColor={buttonColor} 
                    >
                        <Animated.View
                            style={{
                                transform: [
                                    { scaleX: translateValue },
                                    { rotate: rotateInterpolate },
                                ],
                            }}
                        > 
                            { children ? children : cloneElement(iconTextComponent, {
                                style: { fontSize: 24, color: iconTextColor },
                            })}
                        </Animated.View>
                    </Touchable>
                </Animated.View>
            </Animated.View>
        );
    }
}