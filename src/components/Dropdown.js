import React from 'react';
import { Platform, Pressable, Text, Animated, Dimensions,StyleSheet,StatusBar,Easing,I18nManager,Modal,TouchableWithoutFeedback,View } from 'react-native';

const EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SCREEN_INDENT = 8;

const States  = {
    Hidden: 0,
    Animating: 1,
    Shown: 2,
  }

class Menu extends React.Component {
  static defaultProps = {
    animationDuration: 300,
  };

  constructor(props) {
    super(props); 
    this.state = {
      menuState: States.Hidden,

      top: 0,
      left: 0,

      menuWidth: 0,
      menuHeight: 0,

      buttonWidth: 0,
      buttonHeight: 0,

      menuSizeAnimation: new Animated.ValueXY({ x: 0, y: 0 }),
      opacityAnimation: new Animated.Value(0),
    };
  }

  componentDidMount() {
    if (!this.props.visible) {
      return;
    }

    this.show();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible === this.props.visible) {
      return;
    }

    if (this.props.visible) {
      this.show();
    } else {
      this.hide();
    }
  }

    setContainerRef = (ref) => {
        this._container = ref;
    };

    // Start menu animation
    onMenuLayout = (e) => {
        if (this.state.menuState === States.Animating) {
        return;
        }

        const { width, height } = e.nativeEvent.layout;
        this.setState({
            menuState: States.Animating,
            menuWidth: width,
            menuHeight: height,
        },() => {
            Animated.parallel([
            Animated.timing(this.state.menuSizeAnimation, {
                toValue: { x: width, y: height },
                duration: this.props.animationDuration,
                easing: EASING,
                useNativeDriver: false,
            }),
            Animated.timing(this.state.opacityAnimation, {
                toValue: 1,
                duration: this.props.animationDuration,
                easing: EASING,
                useNativeDriver: false,
            }),
            ]).start();
        });
    };

    show = () => {
        this._container?.measureInWindow((left, top, buttonWidth, buttonHeight) => {
        this.setState({
            buttonHeight,
            buttonWidth,
            left,
            menuState: States.Shown,
            top,
        });
        });
    };

    hide = () => {
        Animated.timing(this.state.opacityAnimation, {
            toValue: 0,
            duration: this.props.animationDuration,
            easing: EASING,
            useNativeDriver: false,
        }).start(() => {
            // Reset state
            this.setState({
                menuState: States.Hidden,
                menuSizeAnimation: new Animated.ValueXY({ x: 0, y: 0 }),
                opacityAnimation: new Animated.Value(0),
            });
        });
    };

    onRequestClose = () => {
        this.props.onRequestClose?.();
    };

    render() {
        const { isRTL } = I18nManager; 
        const dimensions = Dimensions.get('window');
        const { width: windowWidth } = dimensions;
        const windowHeight = dimensions.height - (StatusBar.currentHeight || 0);
        const {
            menuSizeAnimation,
            menuWidth,
            menuHeight,
            buttonWidth,
            buttonHeight,
            opacityAnimation,
        } = this.state;

        const menuSize = {
            width: menuSizeAnimation.x,
            height: menuSizeAnimation.y,
        }; 
        let { left, top } = this.state;
        const transforms = [];

        if (
            (isRTL && left + buttonWidth - menuWidth > SCREEN_INDENT) ||
            (!isRTL && left + menuWidth > windowWidth - SCREEN_INDENT)
        ) {
            transforms.push({
                translateX: Animated.multiply(menuSizeAnimation.x, -1),
            });

            left = Math.min(windowWidth - SCREEN_INDENT, left + buttonWidth);
        } else if (left < SCREEN_INDENT) {
            left = SCREEN_INDENT;
        }

        // Flip by Y axis if menu hits bottom screen border
        if (top > windowHeight - menuHeight - SCREEN_INDENT) {
            transforms.push({
                translateY: Animated.multiply(menuSizeAnimation.y, -1),
            });

            top = windowHeight - SCREEN_INDENT;
            top = Math.min(windowHeight - SCREEN_INDENT, top + buttonHeight);
        } else if (top < SCREEN_INDENT) {
            top = SCREEN_INDENT;
        }

        const shadowMenuContainerStyle = {
            opacity: opacityAnimation,
            transform: transforms,
            top,

            // Switch left to right for rtl devices
            ...(isRTL ? { right: left } : { left }),
        };

        const { menuState } = this.state;
        const animationStarted = menuState === States.Animating;
        const modalVisible = menuState === States.Shown || animationStarted;

        const { testID, anchor, style, children } = this.props;

    return (
        <View ref={this.setContainerRef} collapsable={false} testID={testID}>
            {anchor}

            <Modal
                visible={modalVisible}
                onRequestClose={this.onRequestClose}
                supportedOrientations={[
                    'portrait',
                    'portrait-upside-down',
                    'landscape',
                    'landscape-left',
                    'landscape-right',
                ]}
                transparent
            >
                <TouchableWithoutFeedback onPress={this.onRequestClose} accessible={false}>
                    <View style={StyleSheet.absoluteFill}>
                        <Animated.View
                            onLayout={this.onMenuLayout}
                            style={[styles.shadowMenuContainer, shadowMenuContainerStyle, style]}
                        >
                            <Animated.View style={[styles.menuContainer, animationStarted && menuSize]}>
                                {children}
                            </Animated.View>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
  }
}
  
export function MenuItem({
    children,
    disabled = false,
    disabledTextColor = '#bdbdbd',
    onPress,
    pressColor = '#e0e0e0',
    style,
    textStyle,
    renderLeft,
    renderRight,
    ...props
}) {
    return (
        <Pressable
            disabled={disabled}
            style={({ pressed }) => ({
                backgroundColor: Platform.OS !== 'android' && pressed ? pressColor : undefined,
            })}
            android_ripple={{ color: pressColor }}
            onPress={onPress}
            {...props}
        >
            <View style={[{ flexDirection: 'row', alignItems:'center', }, styles.container, style]}>
                {typeof renderLeft === 'function' ? renderLeft() : null }
                <Text numberOfLines={1} style={[styles.title, disabled && { color: disabledTextColor }, textStyle]}>
                    {children}
                </Text>
                {typeof renderRight === 'function' ? renderRight() : null }
            </View>
        </Pressable>
    );
}

export function MenuDivider({ color = 'rgba(0,0,0,0.12)', style }) {
    return <View style={[styles.divider, { borderBottomColor: color }, style]} />;
}

const styles = StyleSheet.create({
    divider: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    container: {
        height: 48,
        justifyContent: 'center',
        maxWidth: 248,
        minWidth: 124,
    },
    title: {
        fontSize: 14,
        fontWeight: '400',
        paddingHorizontal: 16,
        textAlign: 'left',
    },

    shadowMenuContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 4,
        opacity: 0,

        // Shadow
        ...Platform.select({
        ios: {
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 2,
        },
        android: {
            elevation: 8,
        },
        }),
    },
    menuContainer: {
        overflow: 'hidden',
    },
});

export default Menu

/**
 *  https://github.com/mxck/react-native-material-menu
 *  `<Menu
        visible={state?.visible}
        anchor={(
            <Bounceable onPress={()=>setState({ visible: true })}>
                <Icon icon="more" size={24} color="#bbb" />
            </Bounceable>
        )}
        onRequestClose={()=>setState({ visible: false })}
    >              
        <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit" size={16} color="#bbb" />)}>新建笔记</MenuItem>
        <MenuDivider />
        <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} onPress={onShowModal('folder', '新建文件夹')} renderRight={()=>(<Icon icon="folder-plus" size={16} color="#bbb" />)}>新建文件夹</MenuItem>
        <MenuDivider style={{ borderBottomWidth: 6, borderColor: '#F1F1F1'}} /> 
        <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit-alt" size={16} color="#bbb" />)}>编辑文件夹</MenuItem>
        <MenuDivider />
        <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="delete" size={16} color="#bbb" />)}>删除文件夹</MenuItem>
    </Menu>
 */