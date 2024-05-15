import { forwardRef, useCallback, useImperativeHandle,useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import {Dimensions, BackHandler, Animated, Pressable, StyleSheet, View, PanResponder,useWindowDimensions, Keyboard,  Platform } from 'react-native'; 
 
const DEFAULT_HANDLE_BAR_DEFAULT_HEIGHT = 25; // paddingTop (10) + paddingBottom (10) + height (5)

const ANIMATIONS  = {
    SLIDE:'slide',
    SPRING: 'spring',
    FADE: 'fade',
}
 
const DEFAULT_BACKDROP_MASK_COLOR = '#00000052';
const DEFAULT_HEIGHT = '50%';
const DEFAULT_ANIMATION = ANIMATIONS.SLIDE;
const DEFAULT_OPEN_ANIMATION_DURATION = 500;
const DEFAULT_CLOSE_ANIMATION_DURATION = 500;

const CUSTOM_BACKDROP_POSITIONS = {
    TOP: 'top',
    BEHIND: 'behind',
}

const AnimatedTouchableBackdrop = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
    sharedBackdropStyle: StyleSheet.absoluteFillObject,
    container: {
        position: 'absolute',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        left: 0, 
        right: 0,
        bottom: 0, 
        opacity: 1,
    },
});

const Container = forwardRef(({ style, ...otherProps }, ref) => (
    <Animated.View ref={ref} style={[styles.container, style]} {...otherProps} />
));

const AnimatedTouchableBackdropMask = ({
    style,
    isPressable,
    pressHandler,
    android_touchRippleColor,
    ...otherProps
}) => {
    return isPressable ? (
        <AnimatedTouchableBackdrop
            style={[style, styles.sharedBackdropStyle]}
            android_ripple={
            android_touchRippleColor
                ? {
                    borderless: true,
                    color: android_touchRippleColor,
                    foreground: true,
                }
                : undefined
            }
            onPress={pressHandler}
            {...otherProps}
        />
  ) : ( 
    <Animated.View
        style={[style, styles.sharedBackdropStyle]}
        {...otherProps}
    />
  );
};

const Backdrop = ({
    BackdropComponent,
    backdropPosition = CUSTOM_BACKDROP_POSITIONS.BEHIND,
    sheetOpen,
    containerHeight,
    contentContainerHeight,
    _animatedHeight,
    closeOnPress,
    rippleColor,
    pressHandler,
    animatedBackdropOpacity,
    backdropColor,
  }) => {
    const heightStyle = sheetOpen ? containerHeight - contentContainerHeight : 0;
  
    return BackdropComponent ? (
      <View
          style={
          backdropPosition === CUSTOM_BACKDROP_POSITIONS.BEHIND
              ? StyleSheet.absoluteFillObject
              : { height: heightStyle }
          }
      >
          <BackdropComponent _animatedHeight={_animatedHeight} />
      </View>
    ) : closeOnPress ? (
      <AnimatedTouchableBackdropMask
          isPressable={true}
          android_touchRippleColor={rippleColor}
          pressHandler={pressHandler}
          style={{
            opacity: animatedBackdropOpacity,
            backgroundColor: backdropColor,
          }}
          touchSoundDisabled
          key={'TouchableBackdropMask'}
      />
    ) : (
          <AnimatedTouchableBackdropMask
              isPressable={false}
              style={{
                  opacity: animatedBackdropOpacity,
                  backgroundColor: backdropColor,
              }}
              key={'TouchableBackdropMask'}
          />
    );
};

const DefaultHandleBar = ({ style, ...otherProps }) => (
    <View style={materialStyles.dragHandleContainer} {...otherProps}>
        <View style={[materialStyles.dragHandle, style]} />
    </View>
);

const materialStyles = StyleSheet.create({
    dragHandleContainer: {
        padding: 18,
        width: 50,
        alignSelf: 'center',
    },
    dragHandle: {
        height: 4,
        width: 32,
        backgroundColor: '#49454F',
        opacity: 0.4,
        alignSelf: 'center',
        borderRadius: 50,
    },

    contentContainer: {
        backgroundColor: '#F1F1F1',
        // backgroundColor: '#F7F2FA',
        width: '100%',
        overflow: 'hidden',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    contentContainerShadow:
    Platform.OS === 'android'
      ? {
          elevation: 7,
        }
      : {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.29,
          shadowRadius: 4.65,
        },
});

const useAnimatedValue = (initialValue = 0)=> {
    const animatedValue = useRef(new Animated.Value(initialValue)).current;
    return animatedValue;
};

const useHandleKeyboardEvents = (
    sheetHeight,
    sheetOpen,
    heightAnimationDriver,
    contentWrapperRef
) => {
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const keyboardHideSubscription = useRef();
    const keyboardShowSubscription = useRef();

    useEffect(() => {
      keyboardShowSubscription.current = Keyboard.addListener(
        'keyboardDidShow',
        ({ endCoordinates: { height: keyboardHeight } }) => {
            if (sheetOpen) { 
                const keyboardAutoCorrectViewHeight = 50;
                contentWrapperRef.current?.measure?.((...result) => {
                    const sheetYOffset = result[5]; // Y offset of the sheet after keyboard is out
                    const actualSheetHeight = SCREEN_HEIGHT - sheetYOffset; // new height of the sheet (after keyboard offset)
                    
                    const sheetIsOverlayed =
                    actualSheetHeight - sheetHeight < keyboardAutoCorrectViewHeight;
                    const remainingSpace = SCREEN_HEIGHT - keyboardHeight;

                    const fiftyPercent = 0.5 * remainingSpace;
                    const minSheetHeight = 50; 
                    let newSheetHeight = Math.max(
                        minSheetHeight,
                        Math.min(sheetHeight, fiftyPercent)
                    );
                    if (sheetIsOverlayed) newSheetHeight += keyboardHeight;
                    heightAnimationDriver(newSheetHeight, 400).start();
                });
            }
        }
      );
  
      keyboardHideSubscription.current = Keyboard.addListener(
        'keyboardDidHide',
        (_) => {
          if (sheetOpen) heightAnimationDriver(sheetHeight, 200).start();
        }
      );
  
      return () => {
        keyboardHideSubscription.current?.remove();
        keyboardShowSubscription.current?.remove();
      };
    }, [
      sheetHeight,
      SCREEN_HEIGHT,
      sheetOpen,
      heightAnimationDriver,
      contentWrapperRef,
    ]);
  
    return {
      removeKeyboardListeners() {
        keyboardShowSubscription.current?.remove();
        keyboardHideSubscription.current?.remove();
      },
    };
};

const useHandleAndroidBackButtonClose = (
    shouldClose = true,
    closeSheet,
    sheetOpen = false
) => {
    const handler = useRef();
    useEffect(() => {
        handler.current = BackHandler.addEventListener('hardwareBackPress', () => {
            if (sheetOpen) {
                if (shouldClose) {
                    closeSheet?.();
                }
                return true; // prevent back press event bubbling as long as sheet is open
            } else return false; // when sheet is closed allow bubbling
        });

        return () => {
            handler.current?.remove?.();
        };
    }, [shouldClose, closeSheet, sheetOpen]);
};
 
const convertHeight = (
    height ,
    containerHeight ,
    handleBarHidden
) => {

    const SCREEN_HEIGHT = Dimensions.get('window').height;
    let _height = height;
    const errorMsg = 'Invalid `height` prop';

    if (typeof height === 'number') {
        if (height < 0) _height = 0;
        if (height >= containerHeight) {
            if (containerHeight === SCREEN_HEIGHT && !handleBarHidden) {
                _height = containerHeight - DEFAULT_HANDLE_BAR_DEFAULT_HEIGHT;
            } else _height = containerHeight; 
        }
    } else if (typeof height === 'string') {
        const lastPercentIdx = height.lastIndexOf('%'); 
        if (!height.endsWith('%') || height.length <= 1 || height.length > 4)
        throw errorMsg;
        let parsedHeight = Math.abs(parseInt(height.substring(0, lastPercentIdx), 10));

        if (isNaN(parsedHeight)) throw errorMsg;

        if (parsedHeight >= 100) {
            parsedHeight = 100;
        }

        _height = Math.floor((parsedHeight / 100) * containerHeight);
        if (containerHeight === SCREEN_HEIGHT && !handleBarHidden) {
            _height -= DEFAULT_HANDLE_BAR_DEFAULT_HEIGHT;
        }
    } else throw errorMsg;
  
    return _height;
}; 

const normalizeHeight = (height) => {
    const DEVICE_SCREEN_HEIGHT = Dimensions.get('window').height;
    let clampedHeight = DEVICE_SCREEN_HEIGHT;
    if (typeof height === 'number')
      clampedHeight =
        height < 0
          ? 0
          : height > DEVICE_SCREEN_HEIGHT
          ? DEVICE_SCREEN_HEIGHT
          : height;
    return clampedHeight;
};

const separatePaddingStyles = ( style ) => {
    if (!style) return;
    const styleKeys = Object.keys(style || {});
    if (!styleKeys.length) return;
    const styles = {
        paddingStyles: {},
        otherStyles: {},
    };
    for (const key of styleKeys) {
        styles[key.startsWith('padding') ? 'paddingStyles' : 'otherStyles'][key] = style[key];
    }
    return styles;
};
 
const BottomSheet = forwardRef(
(
    {
        backdropMaskColor = DEFAULT_BACKDROP_MASK_COLOR,
        children:Children ,
        animationType = DEFAULT_ANIMATION,
        closeOnBackdropPress = true,
        height = DEFAULT_HEIGHT,
        hideDragHandle = false,
        android_backdropMaskRippleColor,
        dragHandleStyle,
        disableBodyPanning = false,
        disableDragHandlePanning = false,
        customDragHandleComponent,
        style: contentContainerStyle,
        closeOnDragDown = true,
        containerHeight: passedContainerHeight,
        customBackdropComponent: CustomBackdropComponent,
        customBackdropPosition = CUSTOM_BACKDROP_POSITIONS.BEHIND,
        modal = true,
        openDuration = DEFAULT_OPEN_ANIMATION_DURATION,
        closeDuration = DEFAULT_CLOSE_ANIMATION_DURATION,
        customEasingFunction,
        android_closeOnBackPress = true,
        onClose,
        onOpen,
    },
    ref
) => {
  
    useImperativeHandle(ref, () => ({
        open() {
            openBottomSheet();
        },
        close() {
            closeBottomSheet();
        },
    }));

    const SCREEN_HEIGHT = useWindowDimensions().height; // actual container height is measured after layout
    const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT);
    const [sheetOpen, setSheetOpen] = useState(false);
    const _animatedContainerHeight = useAnimatedValue(0);
    const _animatedBackdropMaskOpacity = useAnimatedValue(0);
    const _animatedHeight = useAnimatedValue(0); 
    const contentWrapperRef = useRef(null); 
    const cachedContentWrapperNativeTag = useRef(undefined);


    const sepStyles = useMemo(() => separatePaddingStyles(contentContainerStyle), [contentContainerStyle]);
 
    const Animators = useMemo(() => ({
        _slideEasingFn(value) {
            return value === 1 ? 1 : 1 - Math.pow(2, -10 * value);
        },
        _springEasingFn(value) {
            const c4 = (2 * Math.PI) / 2.5;
            return value === 0
                ? 0
                : value === 1
                ? 1
                : Math.pow(2, -9 * value) * Math.sin((value * 4.5 - 0.75) * c4) + 1;
        },
        animateContainerHeight(toValue, duration = 0) {
            return Animated.timing(_animatedContainerHeight, {
                toValue: toValue,
                useNativeDriver: false,
                duration: duration,
            });
        },
        animateBackdropMaskOpacity(toValue, duration) { 
            const _duration =
                animationType === ANIMATIONS.FADE ? duration : duration / 2.5;

            return Animated.timing(_animatedBackdropMaskOpacity, {
                toValue: toValue,
                useNativeDriver: false,
                duration: _duration,
            });
        },
        animateHeight(toValue, duration) {
            return Animated.timing(_animatedHeight, {
                toValue,
                useNativeDriver: false,
                duration: duration,
                easing:
                customEasingFunction && typeof customEasingFunction === 'function'
                    ? customEasingFunction
                    : animationType === ANIMATIONS.SLIDE
                    ? this._slideEasingFn
                    : this._springEasingFn,
            });
        },
    }), [
        animationType,
        customEasingFunction,
        _animatedContainerHeight,
        _animatedBackdropMaskOpacity,
        _animatedHeight,
    ]);

    const interpolatedOpacity = useMemo(() =>
        animationType === ANIMATIONS.FADE
        ? _animatedBackdropMaskOpacity.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.3, 1],
            extrapolate: 'clamp',
            })
        : contentContainerStyle?.opacity,
    [animationType, contentContainerStyle, _animatedBackdropMaskOpacity]);
 
    const convertedHeight = useMemo(() => {
        const newHeight = convertHeight(height, containerHeight, hideDragHandle); 
        const curHeight = _animatedHeight._value;
        if (sheetOpen && newHeight !== curHeight) {
            if (animationType === ANIMATIONS.FADE)
                _animatedHeight.setValue(newHeight);
            else
                Animators.animateHeight(
                    newHeight,
                    newHeight > curHeight ? openDuration : closeDuration
                ).start();
        }
        return newHeight;
    }, [
        containerHeight,
        height,
        animationType,
        sheetOpen,
        Animators,
        _animatedHeight,
        closeDuration,
        hideDragHandle,
        openDuration,
    ]);

    const { removeKeyboardListeners } = useHandleKeyboardEvents(
        convertedHeight,
        sheetOpen,
        Animators.animateHeight,
        contentWrapperRef
    ); 
    
    const panHandlersFor = (view) => {
        if (view === 'handlebar' && disableDragHandlePanning) return null;
        if (view === 'contentwrapper' && disableBodyPanning) return null;
        return PanResponder.create({
            onMoveShouldSetPanResponder: (evt) => { 
            return view === 'handlebar'
                ? true
                : cachedContentWrapperNativeTag.current === evt?.target?._nativeTag;
            },
            onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) { 
                const relativeOpacity = 1 - gestureState.dy / convertedHeight;
                _animatedBackdropMaskOpacity.setValue(relativeOpacity);

                if (animationType !== ANIMATIONS.FADE)
                _animatedHeight.setValue(convertedHeight - gestureState.dy);
            }
            },
            onPanResponderRelease(_, gestureState) {
            if (gestureState.dy >= convertedHeight / 3 && closeOnDragDown) {
                closeBottomSheet();
            } else {
                _animatedBackdropMaskOpacity.setValue(1);
                if (animationType !== ANIMATIONS.FADE)
                Animators.animateHeight(
                    convertedHeight,
                    openDuration / 2
                ).start();
            }
            },
        }).panHandlers;
    };

    const PolymorphicHandleBar = () => {
        const CustomHandleBar = customDragHandleComponent;
        return hideDragHandle ? null : CustomHandleBar &&
            typeof CustomHandleBar === 'function' ? (
                <View style={{ alignSelf: 'center' }} {...panHandlersFor('handlebar')}>
                    <CustomHandleBar _animatedHeight={_animatedHeight} />
                </View>
        ) : (
            <DefaultHandleBar
                style={dragHandleStyle}
                {...panHandlersFor('handlebar')}
            />
        );
    };
 
    let extractNativeTag = useCallback( ({ target = { } }) => {
        let tag = target._nativeTag 
        if (!cachedContentWrapperNativeTag.current)
        cachedContentWrapperNativeTag.current = tag;
    },[]);
 
    const openBottomSheet = () => { 
        Animators.animateContainerHeight(
            !modal ? convertedHeight : containerHeight
        ).start();
        if (animationType === ANIMATIONS.FADE) {
            _animatedHeight.setValue(convertedHeight);
            Animators.animateBackdropMaskOpacity(1, openDuration).start();
        } else {
            Animators.animateBackdropMaskOpacity(1, openDuration).start();
            Animators.animateHeight(convertedHeight, openDuration).start();
        }
        setSheetOpen(true);

        if (onOpen) {
            onOpen();
        }
    };

    const closeBottomSheet = () => { 
        Animators.animateBackdropMaskOpacity(0, closeDuration).start((anim) => {
            if (anim.finished) {
            if (animationType === ANIMATIONS.FADE) {
                Animators.animateContainerHeight(0).start();
                _animatedHeight.setValue(0);
            } else {
                Animators.animateHeight(0, closeDuration).start();
                Animators.animateContainerHeight(0).start();
            }
            }
        });
        setSheetOpen(false);
        removeKeyboardListeners();
        Keyboard.dismiss();
        if (onClose) {
            onClose();
        }
    };

    const containerViewLayoutHandler = (event) => {
        const newHeight = event.nativeEvent.layout.height;
        setContainerHeight(newHeight);
    
        if (sheetOpen) _animatedContainerHeight.setValue(newHeight);
    };
  
    useLayoutEffect(() => {
        if (!modal) return; // no auto layout adjustment when backdrop is hidden
        else {
            if (typeof passedContainerHeight === 'number') {
                setContainerHeight(normalizeHeight(passedContainerHeight));
            if (sheetOpen)
                _animatedContainerHeight.setValue(passedContainerHeight);
            } else if (
                typeof passedContainerHeight === 'undefined' &&
                containerHeight !== SCREEN_HEIGHT
            ) {
                setContainerHeight(SCREEN_HEIGHT);
                if (sheetOpen) _animatedContainerHeight.setValue(SCREEN_HEIGHT);
            }
        }
    }, [
        modal,
        sheetOpen,
        SCREEN_HEIGHT, 
        containerHeight,
        passedContainerHeight, 
        _animatedContainerHeight,
    ]);
 
    useHandleAndroidBackButtonClose(
        android_closeOnBackPress,
        closeBottomSheet,
        sheetOpen
    );

 
    const ChildNodes = typeof Children === 'function' ? (
        <Children _animatedHeight={_animatedHeight} />
    ) : (
        Children
    );

    return (
    <>
        {typeof passedContainerHeight === 'string' ? (
        
        <View
            onLayout={containerViewLayoutHandler}
            style={{ height: passedContainerHeight }}
        />
        ) : null}

        
        <Container style={{ height: _animatedContainerHeight }}>
            {modal ? (
                <Backdrop
                    BackdropComponent={CustomBackdropComponent}
                    _animatedHeight={_animatedHeight}
                    animatedBackdropOpacity={_animatedBackdropMaskOpacity}
                    backdropColor={backdropMaskColor}
                    backdropPosition={customBackdropPosition}
                    closeOnPress={closeOnBackdropPress}
                    containerHeight={containerHeight}
                    contentContainerHeight={convertedHeight}
                    pressHandler={closeBottomSheet}
                    rippleColor={android_backdropMaskRippleColor}
                    sheetOpen={sheetOpen}
                />
            ) : null}
            <Animated.View
                ref={contentWrapperRef}
                key={'BottomSheetContentContainer'}
                onLayout={extractNativeTag}
                
                style={[
                    !modal ? materialStyles.contentContainerShadow : false,
                    materialStyles.contentContainer, 
                    sepStyles?.otherStyles,
                    {
                        height: _animatedHeight,
                        minHeight: _animatedHeight,
                        opacity: interpolatedOpacity,
                    },
                ]}
                {...panHandlersFor('contentwrapper')}
            >
                <PolymorphicHandleBar />
                <View style={sepStyles?.paddingStyles}>
                    {ChildNodes}
                </View>
            </Animated.View>
        </Container>
    </>
    );
}
);
  
BottomSheet.displayName = 'BottomSheet';
BottomSheet.ANIMATIONS = ANIMATIONS;
   
export default BottomSheet;

// export default ()=>{
//     const sheetRef = useRef(null);

//    return (
//     <View style={{flex: 1,  alignItems: 'center', justifyContent: 'center',}}>
//         {/* <Button title="Open Sheet" onPress={() => sheetRef.current?.open()} /> */}

//         <SingleButton onPress={()=>sheetRef.current?.open()}>Open Sheet</SingleButton>
 
        // <Sheet ref={sheetRef}>
        //     <SingleButton style={{
        //             textAlign: 'center',
        //             fontSize: 20,
        //             fontWeight: '700',
        //             padding: 20, 
        //     }}>
        //         The 😎smart, 📦tiny, and 🎗flexible bottom sheet your app craves
        //     </SingleButton>
        // </Sheet>
//     </View>
//    )
// }
  

 