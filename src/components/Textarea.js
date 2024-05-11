import { useEffect, forwardRef, useImperativeHandle, useRef, useState,memo } from "react";
import { Animated, Keyboard, Pressable, Text, TextInput, View,StyleSheet } from "react-native";

export const VerticalStick = memo(({ focusColor, style, duration = 350 }) => {
	const opacityAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacityAnim, { toValue: 0, useNativeDriver: true, duration: duration }),
				Animated.timing(opacityAnim, { toValue: 1, useNativeDriver: true, duration: duration }),
			]),
			{ iterations: -1 }
		).start();
	}, []);

	return (
		<Animated.View style={{ opacity: opacityAnim }}>
			<View style={[styles.stick, focusColor ? { backgroundColor: focusColor } : {}, style]} />
		</Animated.View>
	);
});

export const useOtpInput = ({ onTextChange, onFilled, numberOfDigits }) => {
	const [text, setText] = useState("");
	const inputRef = useRef(null);
	const focusedInputIndex = text.length;

	const handlePress = () => {
		if (!Keyboard.isVisible()) {
			Keyboard.dismiss();
		}
		inputRef.current?.focus();
	};

	const handleTextChange = (value) => {
		setText(value);
		onTextChange?.(value);
		if (value.length === numberOfDigits) {
			onFilled?.(value);
		}
	};

	const setTextWithRef = (value) => {
		const normalizedValue = value.length > numberOfDigits ? value.slice(0, numberOfDigits) : value;
		handleTextChange(normalizedValue);
	};

	const clear = () => {
		setText("");
	};

	const focus = () => {
		inputRef.current?.focus();
	};

	return {
		models: { text, inputRef, focusedInputIndex },
		actions: { handlePress, handleTextChange, clear, focus },
		forms: { setText, setTextWithRef },
	};
}


export const TextArea = forwardRef((props, ref) => {
	const {
		models: { text, inputRef, focusedInputIndex },
		actions: { clear, handlePress, handleTextChange, focus },
		forms: { setTextWithRef },
	} = useOtpInput(props);

	const {
		numberOfDigits,
		autoFocus = true,
		hideStick,
		focusColor = "#A4D0A4",
		duration,
		secureTextEntry = false,
		theme = {},
	} = props;

	const {
		containerStyle,
		inputsContainerStyle,
		pinCodeContainerStyle,
		pinCodeTextStyle,
		focusStickStyle,
		focusedPinCodeContainerStyle,
		filledPinCodeContainerStyle,
	} = theme;

  useImperativeHandle(ref, () => ({ clear, focus, setValue: setTextWithRef }));

  return (
	<View style={[styles.container, containerStyle]}>
		<View style={[styles.inputsContainer, inputsContainerStyle]}>
            <Text style={styles.codeText}>
                {text}
            </Text>

            <VerticalStick
                focusColor={focusColor}
                style={focusStickStyle}
                duration={duration}
            />
            
            <Text></Text>
		</View>

		<TextInput
			ref={inputRef}
			value={text}
			onChangeText={handleTextChange}
			// maxLength={numberOfDigits}
			autoFocus={autoFocus}
			style={styles.hiddenInput}
			secureTextEntry={secureTextEntry}
			// inputMode="numeric"
			// textContentType="oneTimeCode"  
			// autoComplete="one-time-code"
			testID="otp-input-hidden"
		/>
	</View>
  );
}); 

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
	},
	inputsContainer: {
		flex: 1,
		flexDirection: "row", 
		paddingHorizontal: 12,
	},
	codeContainer: {
		borderWidth: 1,
		borderRadius: 12,
		height: 60,
		width: 44,
		borderColor: "#DFDFDE",
		justifyContent: "center",
		alignItems: "center",
	},
	codeText: {
		fontSize: 28,
	},
	hiddenInput: {
		width: 1,
		height: 1,
		opacity: 0,
	},
	stick: {
		width: 2,
		height: 30,
		backgroundColor: "green",
	},
});


export default TextArea
 
// export default memo(()=>{
//     return (
//         <View style={{marginTop:120}}>
//             <OtpInput 
//                numberOfDigits={6}
//                focusColor="green"
//                focusStickBlinkingDuration={500}
//                onTextChange={(text) => console.log(text)}
//                onFilled={(text) => console.log(`OTP is ${text}`)}
//                theme={{
//                     containerStyle: styles.container,
//                     inputsContainerStyle: styles.inputsContainer,
//                     pinCodeContainerStyle: styles.pinCodeContainer,
//                     pinCodeTextStyle: styles.pinCodeText,
//                     focusStickStyle: styles.focusStick,
//                     focusedPinCodeContainerStyle: styles.activePinCodeContainer
//                }}
//             />
//         </View>
//     ) 
// }) 