import { Animated } from "react-native";
import { useState } from "react";

const useBounceAnimation = () => {
  const [bounceValue] = useState(new Animated.Value(1));

  const bounceAnimation = (value, velocity, bounciness) => {
    Animated.spring(bounceValue, {
      toValue: value,
      velocity,
      bounciness,
      useNativeDriver: true,
    }).start();
  };

  const syntheticBounceAnimation = (bounceEffectIn,bounceEffectOut, bounceVelocityOut, bouncinessOut) => {
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: bounceEffectIn,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: bounceEffectOut,
        velocity: bounceVelocityOut,
        bounciness: bouncinessOut,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    bounceValue,
    bounceAnimation,
    syntheticBounceAnimation,
  };
};

export default useBounceAnimation;