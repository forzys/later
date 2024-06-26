import { Component } from "react";
import { Animated, Pressable } from "react-native";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
 
export default class RNBounceable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bounceValue: new Animated.Value(1),
        };
    }

    bounceAnimation = (value, velocity, bounciness) => {
        const { useNativeDriver = true } = this.props;
        Animated.spring(this.state.bounceValue, {
            toValue: value,
            velocity,
            bounciness,
            useNativeDriver,
        }).start();
    };

    render() {
        const { bounceEffectIn = 0.93, bounceEffectOut = 1,  bounceVelocityIn = 0.1, bounceVelocityOut = 0.4, bouncinessIn = 0, bouncinessOut = 0, children, style, onPress } = this.props;
        return (
            <AnimatedPressable
                {...this.props}
                style={[{ transform: [{ scale: this.state.bounceValue }] }, style]}
                onPressIn={() => {
                    this.bounceAnimation(bounceEffectIn, bounceVelocityIn, bouncinessIn);
                    if(this?.props?.onPressIn){
                        this?.props?.onPressIn();
                    }
                }}
                onPressOut={() => {
                    this.bounceAnimation( bounceEffectOut, bounceVelocityOut, bouncinessOut);
                    if(this?.props?.onPressOut){
                        this?.props?.onPressOut();
                    }
                }}
                onPress={onPress}
            >
                {children}
            </AnimatedPressable>
        );
    }
}