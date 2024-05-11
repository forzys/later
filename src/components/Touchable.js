import { Platform, View, TouchableOpacity, TouchableNativeFeedback } from 'react-native';

const IS_ANDROID = OS === 'android';
const IS_LT_LOLLIPOP = Version < 21;
const noop = () => {};
const { Version, OS } = Platform;

const Touchable = ({ onPress = noop, style = {},  buttonColor = 'white', children }) => {
    if (IS_ANDROID && !IS_LT_LOLLIPOP) {
        return (
            <TouchableNativeFeedback background={TouchableNativeFeedback.SelectableBackgroundBorderless()} onPress={onPress}>
                <View style={[style, { backgroundColor: buttonColor }]}>
                    {children}
                </View>
            </TouchableNativeFeedback>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} style={[style, { backgroundColor: buttonColor }]}>
            {children}
        </TouchableOpacity>
    );
};

export default Touchable;