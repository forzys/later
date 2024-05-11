import { useState, useEffect } from "react";
import { Text, View, Animated, Easing } from "react-native";
import { usePrevious } from "@/hooks";


const NUMBERS = Array(10).fill().map((_, i) => i);

const AnimatedNumber = ({ value, fontStyle, animationDuration, includeComma, easing }) => {
	const prevNumber = usePrevious(value, 0);
	const animateToNumberString = String(Math.abs(value));
	const prevNumberString = String(Math.abs(prevNumber)); 
	const animateToNumbersArr = Array.from(animateToNumberString, Number);
	const prevNumberersArr = Array.from(prevNumberString, Number);

	if (includeComma) {
		const reducedArray = new Array(Math.ceil(animateToNumberString.length / 3)).fill(0);
		const startReducedArray = new Array(Math.ceil(prevNumberString.length / 3)).fill(0);

		reducedArray.map((__, index) => {
			if (index === 0) {
				return;
			}
			animateToNumbersArr.splice(animateToNumberString.length - index * 3, 0, ",");
		});

		startReducedArray.map((__, index) => {
			if (index === 0) {
				return;
			}
			prevNumberersArr.splice(prevNumberString.length - index * 3, 0, ",");
		});
	}

	const [numberHeight, setNumberHeight] = useState(0);

	const animations = animateToNumbersArr.map((__, index) => {
		if (typeof prevNumberersArr[index] !== "number") {
			return new Animated.Value(0);
		}
		const animationHeight = -1 * (numberHeight * prevNumberersArr[index]);
		return new Animated.Value(animationHeight);
	});

	const setButtonLayout = (e) => void setNumberHeight(e.nativeEvent.layout.height)

	useEffect(() => {
		animations.map((animation, index) => {
			if (typeof animateToNumbersArr[index] !== "number") {
				return;
			}
			Animated.timing(animation, {
				toValue: -1 * (numberHeight * animateToNumbersArr[index]),
				duration: animationDuration || 1400,
				useNativeDriver: true,
				easing: easing || Easing.elastic(1.2),
			}).start();
		});
	}, [value, numberHeight]);

	return (
		<>
			{numberHeight !== 0 && (
				<View style={{ flexDirection: "row" }}>
					{value < 0 && ( <Text style={[fontStyle, { height: numberHeight }]}>{"-"}</Text> )} 
					{animateToNumbersArr.map((n, index) => {
						if (typeof n === "string") {
							return ( <Text key={index} style={[fontStyle, { height: numberHeight }]}> {n} </Text>);
						}
						return (
							<View key={index} style={{ height: numberHeight, overflow: "hidden" }}>
								<Animated.View style={[{ transform: [{ translateY: animations[index] }]} ]}>
									{NUMBERS.map((number, i) => (
										<View style={{ flexDirection: "row" }} key={i}>
											<Text style={[fontStyle, { height: numberHeight }]}>{number} </Text>
										</View>
									))}
								</Animated.View>
							</View>
						);
					})}
				</View>
			)}
			<Text onLayout={setButtonLayout} style={[fontStyle, { position: "absolute", top: -999999 }]}> {0} </Text>
		</>
	);
};

export default AnimatedNumber;

 
/**
 *  github: https://github.com/heyman333/react-native-animated-numbers
 *  const [value, setAnimateToNumber] = useState(7979);
 * <AnimatedNumbers
		includeComma
		value={value}
		fontStyle={{fontSize: 50, fontWeight: 'bold'}}
	/>
	<Button title="increase" onPress={()=>setAnimateToNumber(value + 100)} />
 */