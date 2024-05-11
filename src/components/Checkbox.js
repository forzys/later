 
import { PureComponent, useState,  useRef, useCallback, useEffect  } from "react";
import { Text,  View, StyleSheet } from "react-native";
import RNBounceable from "@/common/components/Bounceable";


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
    outerStyle,
    innerStyle,
    checkedColor = "#0bc8a5",
    uncheckedColor = "#f0f0f0",
    checkedTextColor = "#fdfdfd",
    uncheckedTextColor = "#5c5969",
    onPress,
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
        <RNBounceable {...rest} style={[ styles.outerContainer, outerStyle, { borderWidth: isActive ? 1 : 0 }]} onPress={handlePress}>
            <View style={[styles.innerContainer,innerStyle, { backgroundColor }]}>
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
 
export class PureRoundedCheckbox extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            checked: props.isChecked || false,
        };
    }

    handlePress = () => {
        if (typeof this.props.active === "boolean"){
            this.props.onPress && this.props.onPress(this.props.active);
        }  else {
            this.setState({ checked: !this.state.checked },() => this.props.onPress && this.props.onPress(this.state.checked));
        }
    };

    render() {
        const {
            active,
            isChecked,
            children,
            text = "L",
            textStyle,
            outerStyle,
            innerStyle,
            checkedColor = "#0bc8a5",
            uncheckedColor = "#f0f0f0",
            checkedTextColor = "#fdfdfd",
            uncheckedTextColor = "#5c5969",
            onPress,
            ...rest
        } = this.props;

        const { checked } = this.state; 
        const isActive = active || checked;
        const backgroundColor = isActive ? checkedColor : uncheckedColor;
        const textColor = isActive ? checkedTextColor : uncheckedTextColor;

        return (
            <RNBounceable {...rest} style={[styles.pure_outerContainer, outerStyle, { borderWidth:isActive ? 1 : 0 }]} onPress={this.handlePress}>
                <View style={[ styles.pure_innerContainer, innerStyle, {backgroundColor} ]}>
                    {children || (
                        <Text style={[styles.pure_textStyle, textStyle, { color: textColor }]}>
                            {text}
                        </Text>
                    )}
                </View>
            </RNBounceable>
        );
    }
}

const styles =  StyleSheet.create({
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

    pure_outerContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "#eee",
        alignItems: "center",
        justifyContent: "center",
      },
    pure_innerContainer: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        alignItems: "center",
        justifyContent: "center",
      },
    pure_textStyle: {
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default RoundedCheckbox