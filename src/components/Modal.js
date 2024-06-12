
import React from 'react';
import { Modal, View, TouchableWithoutFeedback, Text, SafeAreaView, Platform, ScrollView, StyleSheet } from 'react-native';
import { TouchableOpacity, ActivityIndicator, TouchableNativeFeedback } from 'react-native';

const { OS } = Platform;

 
const TouchableEffect = (props)=> {
  if (OS === 'android') {
    return <TouchableNativeFeedback {...props} />;
  }

  return <TouchableOpacity {...props} />;
}; 
 
const Dialog = ({ 
  visible = false,
  onRequestClose = () => null,
  contentInsetAdjustmentBehavior = 'never',

  onAccessibilityAction,
  importantForAccessibility,
  role,
  children,
  contentStyle,
  title,
  titleStyle,
  buttons,
  buttonsStyle,
  dialogStyle, 
  animationType="fade", 
  onShow,
  onOrientationChange,
  onTouchOutside,
  overlayStyle,
  supportedOrientations,
  statusBarTranslucent,
  keyboardDismissMode,
  keyboardShouldPersistTaps, 
}) => {
  const renderContent = () => {
    return (
      <View style={[styles.content, contentStyle ]}>
        {children}
      </View>
    );
  };

  const renderTitle = () => {
    if (title) {
      return (
        <Text style={[styles.title, titleStyle ]}>
          {title}
        </Text>
      );
    }
  };

  const renderButtons = () => {
    if (buttons) {
      return <View style={[styles.buttons, buttonsStyle]}>{buttons}</View>;
    }
  };

  const renderOutsideTouchable = () => {
    const view = <View style={{flex: 1, width: '100%'}} />;

    if (!onTouchOutside) {
      return view;
    }

    return (
      <TouchableWithoutFeedback  onPress={onTouchOutside} style={{flex: 1, width: '100%'}}>
        {view}
      </TouchableWithoutFeedback>
    );
  };

  const dialogBackgroundColor = OS === 'ios' ? '#e8e8e8' : '#ffffff';
  const dialogBorderRadius = OS === 'ios' ? 5 : 3;

  return (
    <Modal 
      onAccessibilityAction={onAccessibilityAction}
      importantForAccessibility={importantForAccessibility}
      role={role}
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
      onShow={onShow}
      onOrientationChange={onOrientationChange}
      supportedOrientations={supportedOrientations}
      statusBarTranslucent={statusBarTranslucent}
    >
      <ScrollView
        bounces={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}>
        <View style={[ { flex: 1,  backgroundColor: '#000000AA', padding: 24 },  overlayStyle]}>
          <SafeAreaView style={{flex: 1}}>
            {renderOutsideTouchable()} 
            <View
              style={[styles.onDialogStyle(dialogBackgroundColor, dialogBorderRadius), dialogStyle]}>
              {renderTitle()} 
              {renderContent()} 
              {renderButtons()}
            </View> 
            {renderOutsideTouchable()}
          </SafeAreaView>
        </View>
      </ScrollView>
    </Modal>
  );
};

const ConfirmDialog = ({ 
  visible = false,
  onRequestClose = () => null,
  contentInsetAdjustmentBehavior = 'never',

  children, negativeButton, 
  positiveButton, 
  message,
  messageStyle, 
  ...others
})  => {
  
    const getButtonBackgroundColor = (buttonProps ) => {
        const {style, disabled} = buttonProps; 
        if (!style) {
          return 'transparent';
        }
        const {backgroundColor, backgroundColorDisabled} = StyleSheet.flatten(style);
      
        if (disabled) {
          return backgroundColorDisabled;
        }
      
        return backgroundColor;
    };
      
    const getButtonTextColor = (buttonProps) => {
    const {titleStyle, disabled} = buttonProps;
    
    if (!titleStyle) {
        return '#0000FF99';
    }
    
    const {color, colorDisabled} = StyleSheet.flatten(titleStyle);
    
    if (disabled) {
        return colorDisabled;
    }
    
    return color;
    };
      
    const getButtonStyle = (buttonProps)=> {
    const {style} = buttonProps; 
    const backgroundColor = getButtonBackgroundColor(buttonProps); 
    const flattenStyle = StyleSheet.flatten(style);
    delete flattenStyle?.backgroundColorDisabled;
    return Platform.select({
        ios: [
        {
            height: 46,
            justifyContent: 'center',
        },
        flattenStyle,
        {
            backgroundColor,
        },
        ],
        android: [
        flattenStyle,
        {
            backgroundColor,
        },
        ],
    });
    };
    
    const getButtonTextStyle = ( buttonProps,  positive )=> {
    const {style} = buttonProps; 
    const color = getButtonTextColor(buttonProps); 
    const flattenStyle = StyleSheet.flatten(style);
    delete flattenStyle?.backgroundColorDisabled;
    
    return Platform.select({
        ios: [
        {
            textAlign: 'center',
            textAlignVertical: 'center',
            color,
            fontWeight: positive ? 'bold' : 'normal',
        },
        {color},
        flattenStyle,
        ],
        android: [
        {
            height: 36,
            minWidth: 64,
            padding: 8,
            textAlign: 'center',
            textAlignVertical: 'center',
            color,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        {color},
        flattenStyle,
        ],
    });
    };
      
  
    const renderMessage = () => {
        if (!message) {
            return null;
        } 
        return (
            <Text style={[{textAlign: 'center', color: '#00000089', fontSize: 18}, messageStyle]}>
                {message}
            </Text>
        );
    };

  const renderButton = (buttonProps, positive) => {
    if (!buttonProps) {
      return null;
    } 
    const {onPress, disabled} = buttonProps; 
    const containerStyle = getButtonStyle(buttonProps); 
    const textStyle = getButtonTextStyle(buttonProps, positive); 
    const touchableStyle = OS === 'ios' ? {flex: 1} : {};

    return (
      <TouchableEffect
        onPress={onPress}
        disabled={disabled}
        style={touchableStyle}>
        <View style={containerStyle}>
          <Text style={textStyle}>{buttonProps.title}</Text>
        </View>
      </TouchableEffect>
    );
  };

  const renderButtons = () => {
    const containerStyle =
      OS === 'ios'
        ? {flexDirection: 'row'}
        : {flexDirection: 'row', justifyContent: 'flex-end', height: 36};

    const dividerVertStyle =
      OS === 'ios'
        ? {width: negativeButton ? 1 : 0, backgroundColor: '#00000011'}
        : {width: 8};

    const dividerHoriStyle =
      OS === 'ios' ? {height: 1, backgroundColor: '#00000011'} : {height: 0};

    return (
      <View>
        <View style={dividerHoriStyle} />
        <View style={containerStyle}>
          {renderButton(negativeButton, false)}
          <View style={dividerVertStyle} />
          {renderButton(positiveButton, true)}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    return renderMessage();
  };

  return (
    <Dialog {...others} buttons={renderButtons()}>
      {renderContent()}
    </Dialog>
  );
};

const ProgressDialog = ({ 
  visible = false,
  onRequestClose = () => null,
  contentInsetAdjustmentBehavior = 'never',

  message, 
  messageStyle, 
  activityIndicatorColor, 
  activityIndicatorSize, 
  activityIndicatorStyle, 
  ...others 
})  => {
    return (
      <Dialog {...others}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ActivityIndicator animating={true} color={activityIndicatorColor} size={activityIndicatorSize} style={activityIndicatorStyle} />
          <Text style={[{marginLeft: 20, fontSize: 18, color: '#00000089'}, messageStyle]}>
            {message}
          </Text>
        </View>
      </Dialog>
    );
};

const styles = StyleSheet.create({
    onDialogStyle:(bgcolor, radius)=>({
        backgroundColor: bgcolor,
        width: '100%',
        maxHeight: '100%',
        shadowOpacity: 0.24,
        borderRadius: radius,
        elevation: 4,
        shadowOffset: {
          height: 4,
          width: 2,
        },
    }),
    title: {
        textAlign:'center',
        color: '#000000DD',
        fontSize: 20,
        margin: 24,
        marginBottom: 0,
     },
     buttons:{
        width: '100%',
        paddingLeft: 24,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
    },
    content:{
        width: '100%',
        flexShrink: 1,
        padding: 24,
        paddingTop: 20,
    }

})
 
 
Dialog.Confirm = ConfirmDialog
Dialog.Progress = ProgressDialog

export default Dialog;

/***
 *  https://github.com/douglasjunior/react-native-simple-dialogs
    <Dialog
        visible={this.state.dialogVisible}
        title="Custom Dialog"
        onTouchOutside={() => this.setState({dialogVisible: false})} 
    >
        <View>
            // your content here
        </View>
    </Dialog>

    <ConfirmDialog
        title="Confirm Dialog"
        visible={this.state.dialogVisible}
        onTouchOutside={() => this.setState({dialogVisible: false})}
        positiveButton={{
            title: "OK",
            onPress: () => alert("Ok touched!")
        }}
    >
        <View>
            // your content here
        </View>
    </ConfirmDialog>

    <ProgressDialog
        visible={this.state.progressVisible}
        title="Progress Dialog"
        message="Please, wait..."
    />
 */