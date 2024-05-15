import {  View,  TouchableNativeFeedback } from 'react-native';
 
const noop = () => {};

const Touchable = ({ onPress = noop, style = {},  buttonColor = 'white', children }) => {
    return (
        <TouchableNativeFeedback background={TouchableNativeFeedback.SelectableBackgroundBorderless()} onPress={onPress}>
            <View style={[style, { backgroundColor: buttonColor }]}>
                {children}
            </View>
        </TouchableNativeFeedback>
    ); 
};

export default Touchable;