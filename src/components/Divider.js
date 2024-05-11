 
import { View, StyleSheet} from "react-native";

const styles = StyleSheet.create({
    divider: {
      height: 1,
      width: "100%",
      backgroundColor: "#3b3b3b",
    },
    horizontal:{
      height: '50%',
      width: 1,
      alignSelf:'center',
      backgroundColor: "#3b3b3b",
    }
});

const Divider = ({ style, horizontal }) => {
  return <View style={StyleSheet.flatten([horizontal ?  styles.horizontal :  styles.divider, style])} />;
};

export default Divider;