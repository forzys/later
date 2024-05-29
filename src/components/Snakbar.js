import React, { Component } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import Text from '@/common/components/Text'
import Touchable from './Touchable'

const easingValues = {
    entry: Easing.bezier(0.0, 0.0, 0.2, 1),
    exit: Easing.bezier(0.4, 0.0, 1, 1),
};

const durationValues = {
    entry: 225,
    exit: 195,
};

class Snackbar extends Component {
    constructor(props) {
        super(props);
        this.state = {

            translateValue: new Animated.Value(0),
            hideDistance: 9999,
        };
    }

    onLayout = (event)=>{ 
        this.setState({ hideDistance: event.nativeEvent.layout.height }) 
    }

    render() {
        return (
            <Animated.View
                onPress={this?.props?.onBoxPress}
                style={[
                    styles.limitContainer,
                    {
                        height: this.state.translateValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, this.state.hideDistance],
                        }),
                    },
                    this.props.position === 'top'
                    ? { top: this.props.top }
                    : { bottom: this.props.bottom },
                ]} 
            >
                <Animated.View
                    style={[
                        this.props.containerStyle,
                        styles.container,
                        {
                            backgroundColor: this.props.backgroundColor,
                            left: this.props.left,
                            right: this.props.right,
                        },
                        {
                            [this.props.position]: this.state.translateValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [this.state.hideDistance * -1, 0],
                            }),
                        },
                    ]}
                    onLayout={this.onLayout}
                >
                    {
                        typeof this.props.children !== 'undefined'
                        ? this.props.children
                        : typeof this.props.message === 'function'
                        ? this.props.message()
                        : (
                            <Text style={[this.props.messageStyle, styles.textMessage, { color: this.props.messageColor }]}>
                                {this.props.message}
                            </Text>
                        )
                    }
                    {
                        this.props.actionHandler !== null && !!this.props.action
                        ? (
                            typeof this.props.action === 'function' 
                            ? this.props.action()
                            : ( 
                                <Touchable onPress={this.props.actionHandler}>
                                    <Text style={[ this.props.actionStyle, styles.actionText, { color: this.props.accentColor }]}>
                                        {this.props.action}
                                    </Text>
                                </Touchable>
                            )
                        )
                        : null
                    }
                </Animated.View>
            </Animated.View>
        );
    }

    componentDidMount() {
        if (this.props.visible) {
            this.state.translateValue.setValue(1);
        } else {
            this.state.translateValue.setValue(0);
        }
    }

 
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.visible && !this.props.visible) {
            Animated.timing(this.state.translateValue, {
                duration: durationValues.entry,
                toValue: 1,
                easing: easingValues.entry,
                useNativeDriver: false
            }).start();
            if (nextProps.autoHidingTime) {
                const hideFunc = this.hideSnackbar.bind(this);
                setTimeout(hideFunc, nextProps.autoHidingTime);
            }
        } else if (!nextProps.visible && this.props.visible) {
            this.hideSnackbar();
        }
    }

 
    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (this.props.distanceCallback !== null && (  nextProps.visible !== this.props.visible || nextState.hideDistance !== this.state.hideDistance)) {
            if (nextProps.visible) {
                this.props.distanceCallback(nextState.hideDistance + this.props[this.props.position]);
            } else {
                this.props.distanceCallback(this.props[this.props.position]);
            }
        }
    }

 
    hideSnackbar() {
        Animated.timing(this.state.translateValue, {
            duration: durationValues.exit,
            toValue: 0,
            easing: easingValues.exit,
            useNativeDriver: false
        }).start();
    }
}

Snackbar.defaultProps = {
    accentColor: 'orange',
    messageColor: '#FFFFFF',
    backgroundColor: '#484848',
    distanceCallback: null,
    actionHandler: null,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    visible: false,
    position: 'bottom',
    // actionText: '',
    action:'',
    // textMessage: '',
    message: '',
    autoHidingTime: 0, // Default value will not auto hide the snack bar as the old version.
    containerStyle: {},
    messageStyle: {},
    actionStyle: {},
};

const styles = StyleSheet.create({
    limitContainer: {
        position: 'absolute',
        overflow: 'hidden',
        left: 0,
        right: 0,
        zIndex: 9999, 
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
    },
    textMessage: {
        fontSize: 14,
        flex: 1,
        textAlign: 'left',
        paddingStart: 20,
        paddingTop: 14,
        paddingBottom: 14,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        paddingEnd: 20,
        paddingTop: 14,
        paddingBottom: 14,
    },
});

export default Snackbar;