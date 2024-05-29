import * as React from "react";
import {
  View,
  Text, 
  Modal,
  TouchableHighlight, 
  StyleSheet,
  Dimensions
} from "react-native";
 
import Divider from "./Divider";
import { ActionButton } from "./Button";
 
const { width: ScreenWidth } = Dimensions.get("screen");

const PickerModal  = ({
  style,
  data,
  title,
  onPress,
  isVisible,
  modalProps,
  dividerStyle,
  titleTextStyle,
  cancelButtonStyle,
  titleTextContainer,
  cancelButtonTextStyle,
  actionButtonProps,
  cancelButtonUnderlayColor = "rgba(200,200,200,0.1)",
  TouchableComponent = TouchableHighlight,
  onBackdropPress,
  onCancelPress,
  ...rest
}) => {
  const Title = () => (
    <View style={[styles.titleTextContainer, titleTextContainer]}>
      <Text style={[styles.titleTextStyle, titleTextStyle]}>{title}</Text>
    </View>
  );

  const CancelButton = () => (
    <TouchableComponent
      underlayColor={cancelButtonUnderlayColor}
      style={[styles.cancelButtonStyle, cancelButtonStyle]}
      onPress={onCancelPress}
    >
      <Text style={[styles.cancelButtonTextStyle, cancelButtonTextStyle]}>
        Cancel
      </Text>
    </TouchableComponent>
  );

  const Picker = () => (
    <View style={[styles.mainContent, style]}>
      <Title />
      <Divider style={dividerStyle} />
      {data.map((item, index) => (
        <ActionButton
          key={index}
          TouchableComponent={TouchableComponent}
          isLastItem={index === data.length - 1}
          {...actionButtonProps}
          text={item}
          onActionPress={() => onPress && onPress(item, index)}
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent 
      {...modalProps}
      animationType="slide" 
      onBackdropPress={onBackdropPress}
    >
        <View style={styles.container}>
          <Picker />
          <CancelButton />
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
      bottom: 32,
      position: "absolute", 
      alignSelf:'center'
    },
    mainContent: {
      width: ScreenWidth * 0.9,
      backgroundColor: "#232323",
      borderRadius: 12,
      paddingTop: 16,
    },
    titleTextStyle: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
      paddingBottom: 16,
    },
    titleTextContainer: {
      width: ScreenWidth * 0.7,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    cancelButtonStyle: {
      height: 50,
      width: ScreenWidth * 0.9,
      backgroundColor: "#232323",
      borderRadius: 12,
      marginTop: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonTextStyle: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "500",
    },
});

export default PickerModal;

/***
 * github https://github.com/WrathChaos/react-native-picker-modal/tree/master
 * <PickerModal
    title="You can either take a picture or select one from your album."
    isVisible={isVisible}
    data={["Take a photo", "Select from album"]}
    onPress={(selectedItem: string, index: number) => {
      console.log({ selectedItem, index });
    }}
    onCancelPress={() => {
      setVisible(false);
    }}
    onBackdropPress={() => {
      setVisible(false);
    }}
  />
 */