import React, { memo } from "react";
import { TouchableOpacity, TouchableWithoutFeedback, Text, View,  StyleSheet } from "react-native"; 
import Bounceable from '@/common/components/Bounceable'
import Divider from "./Divider"; 

const _dynamicBorderStyle = (isLastItem) => ({
  borderBottomLeftRadius: isLastItem ? 12 : 0,
  borderBottomRightRadius: isLastItem ? 12 : 0,
});

const styles = StyleSheet.create({
  container: {
    width: 75,
    height: 35,
    backgroundColor: '#895aaf',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 13,
    color: '#fff',
  },

  actionButtonStyle: {
    height: 50,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonTextStyle: {
    color: "#fff",
    fontWeight: "bold",
  },
});

const Button = ({ style, textStyle, text, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}> 
            <Text style={[styles.textStyle, textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
};

export const ActionButton = memo(({
  text,
  divider,
  isLastItem = false,
  dividerStyle,
  style,
  textStyle,
  TouchableComponent = TouchableWithoutFeedback,
  actionButtonUnderlayColor = "rgba(0,0,0,0.3)",
  onPress,
  horizontal = false,
})=>{
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableComponent
        underlayColor={actionButtonUnderlayColor}
        style={[
          styles.actionButtonStyle,
          style,
          _dynamicBorderStyle(isLastItem),
        ]}
        onPress={onPress}
      >
        <Text style={[styles.actionButtonTextStyle, textStyle]}>
          {text}
        </Text>
      </TouchableComponent>
      
      {divider && <Divider horizontal={horizontal} style={[{backgroundColor:'#FFF'},dividerStyle]} />}
    </View>
  );
})

 


export default Button;