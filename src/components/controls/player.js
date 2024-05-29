 
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from 'react';

import {
  Dimensions, 
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View, 
  Platform, 
  ActivityIndicator, 
} from 'react-native';

import Icon from '@/common/components/Icon';

import { Slider } from 'react-native-awesome-slider';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Orientation, { OrientationType } from 'react-native-orientation-locker';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video'; 
import Text from '@/common/components/Text';
  
const Ripple = memo(forwardRef(
  (
    {
      children,
      containerStyle,
      duration = 600,
      backgroundColor = 'rgba(255,255,255,.3)',
      onAnimationEnd,
      overflow,
      style,
    },
    ref,
  ) => {
    const scale = useSharedValue(0);
    const centerX = useSharedValue(0);
    const centerY = useSharedValue(0);
    const isFinished = useSharedValue(false);
    const rippleOpacity = useSharedValue(1);
    const [radius, setRadius] = useState(-1);

    const rStyle = useAnimatedStyle(() => {
      const translateX = centerX.value - radius;
      const translateY = centerY.value - radius;

      return {
        opacity: rippleOpacity.value,

        transform: [
          { translateX },
          { translateY },
          {
            scale: scale.value,
          },
        ],
      };
    }, [radius]);
    useImperativeHandle(ref, () => ({
      onPress: ({ x, y }) => {
        'worklet';

        centerX.value = x;
        centerY.value = y;

        rippleOpacity.value = 1;
        scale.value = 0;
        scale.value = withTiming(1, { duration }, finised => {
          if (finised) {
            isFinished.value = true;
            scale.value = withTiming(0, { duration: 0 });
            if (onAnimationEnd) {
              runOnJS(onAnimationEnd)();
            }
          }
        });
      },
    }));

    return (
      <View
        onLayout={({
          nativeEvent: {
            layout: { width, height },
          },
        }) => {
          setRadius(Math.sqrt(width ** 2 + height ** 2));
        }}
        style={[style]}
        pointerEvents="none">
        {radius > -1 && (
          <Animated.View
            style={[
              style,
              containerStyle,
              { overflow: !overflow ? 'hidden' : 'visible' },
            ]}>
            {children}
            <Animated.View
              style={[
                {
                  backgroundColor,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  zIndex: 1121,
                },
                rStyle,
              ]}
            />
          </Animated.View>
        )}
      </View>
    );
  },
)) 
 
 
const TapControler  = ({ onPress, style, children }) => {
  const gesture = Gesture.Tap().onEnd((_e, success) => {
    if (success) {
      onPress();
    }
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View hitSlop={{ left: 8, bottom: 4, right: 8, top: 4 }} style={style}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}; 

const normalize = (size) => size; 

const isIos = Platform.OS === 'ios';

const bin = (value) => {
  'worklet';
  return value ? 1 : 0;
};

const useRefs = () => {
  const rippleLeft = useRef(null);
  const rippleRight = useRef(null); 
  return {
    rippleLeft,
    rippleRight,
  };
}; 
 
 
const palette = {
  transparent: `rgba(0,0,0,0)`,
  Main: (opacity = 1) => `rgba(234, 51, 35, ${opacity})`,
  ActiveMain: (opacity = 1) => `rgba(41, 142, 136, ${opacity})`,
  Danger: (opacity = 1) => `rgba(255, 61, 74, ${opacity})`,
  Warning: (opacity = 1) => `rgba(255, 187, 0, ${opacity})`,
  Info: (opacity = 1) => `rgba(0, 99, 247, ${opacity})`,
  Success: (opacity = 1) => `rgba(1, 208, 134, ${opacity})`,
  W: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  G1: (opacity = 1) => `rgba(245, 247, 250, ${opacity})`,
  G2: (opacity = 1) => `rgba(225, 227, 229, ${opacity})`,
  G3: (opacity = 1) => `rgba(195, 197, 199, ${opacity})`,
  G4: (opacity = 1) => `rgba(157, 159, 163, ${opacity})`,
  G5: (opacity = 1) => `rgba(108, 110, 112, ${opacity})`,
  G6: (opacity = 1) => `rgba(39, 41, 46, ${opacity})`,
  G7: (opacity = 1) => `rgba(44, 45, 47, ${opacity})`,
  G8: (opacity = 1) => `rgba(23, 26, 31, ${opacity})`,
  B: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
}; 

const VideoLoader = memo(function VideoLoader({ loading }) {
  if (!loading) return null;
  return (
    <View style={loaderStyle.container}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
});

const loaderStyle = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
}); 
 
function padStart(string, length, chars) {
  const strLength = length ? String(string).length : 0; 
  return length && strLength < length ?  String(string).padStart(length, chars) : string || '';
 
}
 
const formatTime = ({ time = 0, symbol = '', duration = 0, showHours = false }) => {
  time = Math.min(Math.max(time, 0), duration);

  if (!showHours) {
    const formattedMinutes = padStart(Math.floor(time / 60).toFixed(0), 2, '0');
    const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');

    return `${symbol}${formattedMinutes}:${formattedSeconds}`;
  }

  const formattedHours = padStart(Math.floor(time / 3600).toFixed(0), 2, '0');
  const formattedMinutes = padStart((Math.floor(time / 60) % 60).toFixed(0), 2, '0');
  const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');

  return `${symbol}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const secondToTime = (seconds) => {
  const hour = Math.floor(seconds / 3600);
  const residualFromHour = seconds % 3600;
  const minute = `${Math.floor(residualFromHour / 60)}`.padStart(2, '0');
  const second = `${Math.floor(residualFromHour % 60)}`.padStart(2, '0');
  let output = `${minute}:${second}`;
  hour && (output = `${hour}:${output}`);
  return output;
};

const formatTimeToMins = (duration) => {
  const formattedMinutes = padStart( (Math.floor(duration / 60) % 60).toFixed(0), 2, '0');
  const formattedSeconds = padStart( Math.floor(duration % 60).toFixed(0), 2,'0');

  return `${formattedMinutes}:${formattedSeconds}`;
};
 
 
const { width, height, scale, fontScale } = Dimensions.get('window');

const VIDEO_DEFAULT_HEIGHT = width * (9 / 16); 

const controlAnimteConfig = {
  duration: 200,
};
 
const clamp = ( value, lowerBound, upperBound) => {
    'worklet';
    return Math.min(Math.max(lowerBound, value), upperBound);
};

const VideoPlayer = forwardRef(
  (
    {
      resizeMode = 'contain',
      showOnStart = true,
      source,
      style,
      onEnterFullscreen,
      onExitFullscreen,
      controlTimeout = 2000,
      videoDefaultHeight = VIDEO_DEFAULT_HEIGHT,
      headerBarTitle = '',
      onTapBack,
      navigation,
      autoPlay = false,
      onToggleAutoPlay,
      onTapMore,
      doubleTapInterval = 500,
      theme = {
        minimumTrackTintColor: palette.Main(1),
        maximumTrackTintColor: palette.B(0.6),
        cacheTrackTintColor: palette.G1(1),
        bubbleBackgroundColor: palette.B(0.8),
        disableMinTrackTintColor: palette.Main(1),
      },
      paused,
      onPausedChange,
      onTapPause,
      sliderProps,
      videoHeight,
      customAnimationStyle,
      onCustomPanGesture,
      isFullScreen,
      disableControl,
      renderBackIcon,
      renderMore,
      renderFullScreen,
      renderFullScreenBackIcon,
      onVideoPlayEnd,
      onAutoPlayText = 'Autoplay is on',
      offAutoPlayText = 'Autoplay is off',
      children,
      onPostProgress,
      onPostSeek,
      ...rest
    },
    ref,
  ) => {
   

    const videoPlayer = useRef(null);
    const mounted = useRef(false);
    const isSeeking = useRef(false);


    const insets = useSafeAreaInsets();
    const insetsRef = useRef(insets);
    const dimensions = useWindowDimensions();

    const leftDoubleTapBoundary =
      dimensions.width / 2 - insets.left - insets.right - 80;

    const rightDoubleTapBoundary =
      dimensions.width - leftDoubleTapBoundary - insets.left - insets.right;

    const [isFullScreenState, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoadEnd, setIsLoadEnd] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const [showTimeRemaining, setShowTimeRemaining] = useState(true);
    const [allowAutoPlayVideo, setAllowAutoPlayVideo] = useState(autoPlay);

   

    useImperativeHandle(ref, () => ({
      setPlay: () => {
        'worklet';
        checkTapTakesEffect();
        play();
      },
      setPause: () => {
        'worklet';
        checkTapTakesEffect();
        pause();
      },
      toggleFullSreen: (isFullScrren) => {
        isFullScrren ? enterFullScreen() : exitFullScreen();
      },
      toggleControlViewOpacity: (isShow) => {
        'worklet';
        isShow ? showControlAnimation() : hideControlAnimation();
      },
      setSeekTo: (seconds) => {
        seekTo(seconds);
      },
    }));
  



    const autoPlayAnimation = useSharedValue(autoPlay ? 1 : 0);
    const { rippleLeft, rippleRight } = useRefs();
   
    const controlViewOpacity = useSharedValue(showOnStart ? 1 : 0);

    const autoPlayTextAnimation = useSharedValue(0);
    const doubleLeftOpacity = useSharedValue(0);
    const doubleRightOpacity = useSharedValue(0);

    const videoScale = useSharedValue(1);
    const videoTransY = useSharedValue(0);
    const panIsVertical = useSharedValue(false);

    const doubleTapIsAlive = useSharedValue(false);

    const max = useSharedValue(100);
    const min = useSharedValue(0);
    const isScrubbing = useSharedValue(false);

    const progress = useSharedValue(0);
    const defaultVideoStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: videoScale.value,
          },
          {
            translateY: videoTransY.value,
          },
        ],
        height: videoHeight.value,
      };
    }, []);
    const videoStyle = customAnimationStyle
      ? customAnimationStyle
      : defaultVideoStyle;

    const bottomControlStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: isFullScreen.value ? -42 : 0,
          },
        ],
      };
    });
    const topControlStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: isFullScreen.value ? -42 : 0,
          },
        ],
        opacity: withTiming(bin(!isFullScreen.value)),
      };
    });
    const topFullscreenControlStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(bin(isFullScreen.value)),
      };
    });

    const bottomSliderStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(bin(!isFullScreen.value)),
      };
    });
    const fullScreenSliderStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(bin(isFullScreen.value)),
      };
    });
    const controlViewStyles = useAnimatedStyle(() => {
      return {
        opacity: controlViewOpacity.value,
      };
    });

    const autoPlayTextStyle = useAnimatedStyle(() => {
      return {
        opacity: autoPlayTextAnimation.value,
      };
    });

    const getDoubleLeftStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(doubleLeftOpacity.value),
      };
    });

    const getDoubleRightStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(doubleRightOpacity.value),
      };
    });
    
    const playAnimated = useDerivedValue(() => {
      return paused ? 0.5 : 0;
    }, [paused]);

    const playAnimatedProps = useAnimatedProps(() => {
      return {
        progress: withTiming(playAnimated.value),
      };
    });
    const fullscreenAnimatedProps = useAnimatedProps(() => {
      return {
        progress: withTiming(isFullScreen.value ? 0.5 : 0),
      };
    });
    const autoPlayAnimatedProps = useAnimatedProps(() => {
      return {
        progress: withTiming(autoPlayAnimation.value, { duration: 600 }),
      };
    });
   
    useEffect(() => {
      mounted.current = true;
      Orientation.lockToPortrait();
      StatusBar.setBarStyle('light-content');
      paused ? pause() : play();
      const unBeforeRemove = navigation?.addListener(
        'beforeRemove',
        (e) => {
          e?.preventDefault();
          if (isFullScreen.value) {
            toggleFullScreen();
          } else {
            navigation.dispatch(e.data.action);
          }
        },
      );
      return () => {
        mounted.current = false;
        clearControlTimeout();
        pause();
        Orientation.lockToPortrait();
        unBeforeRemove && unBeforeRemove();
      }; 
    }, []);

  
    const setControlTimeout = () => {
      'worklet';
      controlViewOpacity.value = withDelay(controlTimeout, withTiming(0));
    };

 
    const clearControlTimeout = () => {
      'worklet';
      cancelAnimation(controlViewOpacity);
    };

  
    const resetControlTimeout = () => {
      'worklet';
      clearControlTimeout();
      setControlTimeout();
    };

  
    const showControlAnimation = () => {
      'worklet';
      controlViewOpacity.value = withTiming(1, controlAnimteConfig);
      setControlTimeout();
    };
   
    const hideControlAnimation = () => {
      'worklet';
      controlViewOpacity.value = withTiming(0, controlAnimteConfig);
    };
   
    const checkTapTakesEffect = () => {
      'worklet';
      if (disableControl) {
        return false;
      }
      resetControlTimeout();
      if (controlViewOpacity.value === 0) {
        showControlAnimation();
        return false;
      }
      return true;
    };

    const seekByStep = (isBack = false) => {
      seekTo(currentTime - (isBack ? 10 : -10));
    };
 
    const enterFullScreen = () => {
      onEnterFullscreen?.();
      setIsFullscreen(true);
      StatusBar.setHidden(true, 'fade');
      Orientation.lockToLandscape();
      isFullScreen.value = true;
      videoHeight.value = width;
    };

    const exitFullScreen = () => {
      onExitFullscreen?.();
      setIsFullscreen(false);
      StatusBar.setHidden(false, 'fade');
      Orientation.lockToPortrait();
      isFullScreen.value = false;
      videoHeight.value = videoDefaultHeight;
    };
    const toggleFullScreenOnJS = () => {
      Orientation.getOrientation(orientation => {
        if (isFullScreen.value || orientation !== OrientationType.PORTRAIT) {
          exitFullScreen();
          StatusBar.setHidden(false, 'fade');
        } else {
          enterFullScreen();
          StatusBar.setHidden(true, 'fade');
        }
      });
    };
    const toggleFullScreen = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }

      runOnJS(toggleFullScreenOnJS)();
    };
 
    const defalutPanGesture = Gesture.Pan()
      .onStart(({ velocityY, velocityX }) => {
        panIsVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
      })
      .onUpdate(({ translationY }) => {
        controlViewOpacity.value = withTiming(0, { duration: 100 });
        if (isFullScreen.value) {
          if (translationY > 0 && Math.abs(translationY) < 100) {
            videoScale.value = clamp(
              0.9,
              1 - Math.abs(translationY) * 0.008,
              1,
            );
            videoTransY.value = translationY;
          }
        } else {
          if (translationY < 0 && Math.abs(translationY) < 40) {
            videoScale.value = Math.abs(translationY) * 0.012 + 1;
          }
        }
      })
      .onEnd(({ translationY }, success) => {
        if (!panIsVertical.value && !success) {
          return;
        }
        if (isFullScreen.value) {
          if (translationY >= 100) {
            runOnJS(exitFullScreen)();
          }
        } else {
          if (-translationY >= 40) {
            runOnJS(enterFullScreen)();
          }
        }
        videoTransY.value = 0;
        videoScale.value = withTiming(1);
      });

    const onPanGesture = onCustomPanGesture
      ? onCustomPanGesture
      : defalutPanGesture;

    const singleTapHandler = Gesture.Tap().onEnd((_event, success) => {
      if (disableControl) {
        return;
      }
      if (success) {
        if (controlViewOpacity.value === 0) {
          controlViewOpacity.value = withTiming(1, controlAnimteConfig);
          setControlTimeout();
        } else {
          controlViewOpacity.value = withTiming(0, controlAnimteConfig);
        }
      }
    });

    const doubleTapHandle = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(doubleTapInterval)
      .onStart(({ x }) => {
        doubleTapIsAlive.value =
          x < leftDoubleTapBoundary && x > rightDoubleTapBoundary;
      })
      .onEnd(({ x, y, numberOfPointers }, success) => {
        if (success) {
          if (numberOfPointers !== 1) {
            return;
          }
          if (x < leftDoubleTapBoundary) {
            doubleLeftOpacity.value = 1;
            rippleLeft.current?.onPress({ x, y });
            runOnJS(seekByStep)(true);
            return;
          }
          if (x > rightDoubleTapBoundary) {
            doubleRightOpacity.value = 1;
            rippleRight.current?.onPress({
              x: x - rightDoubleTapBoundary,
              y,
            });
            runOnJS(seekByStep)(false);

            return;
          }
        }
      });
 
    const togglePlayOnJS = () => {
      if (isLoadEnd) {
        onReplyVideo();
        setIsLoadEnd(false);
      }
      onTapPause?.(!paused);
      paused ? play() : pause();
    };
    const onPauseTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(togglePlayOnJS)();
    };
   
    const onBackTapHandlerOnJS = () => {
      Orientation.getOrientation(orientation => {
        if (isFullScreen.value || orientation !== OrientationType.PORTRAIT) {
          setIsFullscreen(false);
          exitFullScreen();
          StatusBar.setHidden(false, 'fade');
        } else {
          onTapBack?.();
        }
      });
    };

   
    const onLoadStart = () => {
      setIsLoading(true);
    };

   
    const toggleTimerOnJS = () => {
      setShowTimeRemaining(!showTimeRemaining);
    };
    const toggleTimer = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(toggleTimerOnJS)();
    };

    const onTapSlider = () => {
      if (disableControl) {
        return;
      }
      if (controlViewOpacity.value === 0) {
        showControlAnimation();
      }
    };
  
    const calculateTime = () => {
      return showTimeRemaining
        ? `${formatTimeToMins(currentTime)}`
        : `-${formatTime({
            time: duration - currentTime,
            duration: duration,
          })}`;
    };
 
    const seekTo = (time = 0) => {
      setCurrentTime(time);
      videoPlayer.current?.seek(time);
    };
    const onLoad = (data) => {
      setDuration(data?.duration);
      max.value = data?.duration;
      setIsLoading(false);
      setControlTimeout();
    };
    const onEnd = () => {
      setIsLoadEnd(true);
      pause();
      onVideoPlayEnd?.();
    };
   
    const onSeek = (data) => {
      if (isScrubbing.value) { 
        if (!isSeeking.current) {
          setControlTimeout();
          pause();
        }
        isSeeking.current = false;
        isScrubbing.value = false;

        setCurrentTime(data.currentTime);
      } else {
        isSeeking.current = false;
      }
      if (onPostSeek) {
        onPostSeek(data);
      }
    };
 
     const onProgress = (data) => {
      const { currentTime: cTime } = data;
      if (!isScrubbing.value) {
        if (!isSeeking.current) {
          progress.value = cTime;
        }
        setCurrentTime(cTime);
      }
      if (onPostProgress) {
        onPostProgress(data);
      }
    };
    /**
     * on replay video
     */
    const onReplyVideo = () => {
      seekTo(0);
      setCurrentTime(0);
      progress.value = 0;
    };

    /**
     * play the video
     */
    const play = () => {
      onPausedChange(false);
    };

    /**
     * pause the video
     */
    const pause = () => {
      onPausedChange(true);
    };
    /**
     * on toggle auto play mode
     * @returns
     */
    const toggleAutoPlayOnJS = () => {
      setAllowAutoPlayVideo(!allowAutoPlayVideo);
      onToggleAutoPlay?.(!allowAutoPlayVideo);
    };
    const toggleAutoPlay = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }

      autoPlayAnimation.value = autoPlayAnimation.value === 0 ? 0.5 : 0;
      autoPlayTextAnimation.value = withTiming(1);
      autoPlayTextAnimation.value = withDelay(3000, withTiming(0));
      runOnJS(toggleAutoPlayOnJS)();
    };
    const _renderMore = useCallback(
      () => (
        <TapControler onPress={onMoreTapHandler}>
          {renderMore ? (
            renderMore()
          ) : (
            // <Image
            //   source={require('./assets/more_24.png')}
            //   style={styles.more}
            // />
            <Icon icon="more" size={22}  style={styles.more} />
          )}
        </TapControler>
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [renderMore],
    );
    const onBackTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      runOnJS(onBackTapHandlerOnJS)();
    };

    const _renderBack = useCallback(
      () => (
        <TapControler onPress={onBackTapHandler}>
          {renderBackIcon ? (
            renderBackIcon()
          ) : (
            <Icon icon="chevron-left" size={22}  style={styles.back} />
            // <Image
            //   source={require('./assets/right_16.png')}
            //   style={styles.back}
            // />
          )}
        </TapControler>
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [renderBackIcon],
    );
    const _renderFullScreenBack = useCallback(
      () => (
        <TapControler onPress={onBackTapHandler}>
          {renderFullScreenBackIcon ? (
            renderFullScreenBackIcon()
          ) : (
            <Icon icon="more" size={22} style={styles.back} />
            // <Image
            //   source={require('./assets/right_16.png')}
            //   style={styles.back}
            // />
          )}
        </TapControler>
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [renderBackIcon],
    );
    const onMoreTapHandler = () => {
      'worklet';
      const status = checkTapTakesEffect();
      if (!status) {
        return;
      }
      if (onTapMore) {
        runOnJS(onTapMore)();
      }
    };

    /**
     * Render the seekbar and attach its handlers
     */
    const onSlidingComplete = (val) => {
      isSeeking.current = true;
      seekTo(val);
    };
    const onSlidingStart = () => {
      clearControlTimeout();
    };
    const taps = Gesture.Exclusive(doubleTapHandle, singleTapHandler);
    const gesture = Gesture.Race(onPanGesture, taps);
    return (
      <>
        <StatusBar
          barStyle={'light-content'}
          translucent
          backgroundColor={'#000'}
        />

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, videoStyle, style]}>
            <Video
              {...rest}
              ref={videoPlayer}
              resizeMode={resizeMode}
              paused={paused}
              onLoadStart={onLoadStart}
              style={styles.video}
              source={source}
              onLoad={onLoad}
              onSeek={onSeek}
              onEnd={onEnd}
              onProgress={onProgress}
              fullscreenAutorotate={true}
            />
            {Boolean(children) && children}
            <VideoLoader loading={loading} />
            <Animated.View style={StyleSheet.absoluteFillObject}>
              <Animated.View style={[styles.controlView, controlViewStyles]}>
                <Animated.View
                  hitSlop={{ left: 8, bottom: 8, right: 8, top: 8 }}
                  style={[
                    controlStyle.group,
                    styles.topControls,
                    topControlStyle,
                  ]}>
                  {Boolean(onTapBack) && _renderBack()}
                  <View style={controlStyle.line}>
                    {Boolean(onToggleAutoPlay) && (
                      <Animated.View
                        style={[controlStyle.autoPlayText, autoPlayTextStyle]}>
                        <Text t4 color={'#fff'}>
                            { allowAutoPlayVideo
                            ? onAutoPlayText
                            : offAutoPlayText}
                        </Text>
                      </Animated.View>
                    )}

                    {Boolean(onToggleAutoPlay) && (
                      <TapControler
                        onPress={toggleAutoPlay}
                        style={controlStyle.autoPlay}>

                        <Icon icon="play" size={25} color="#FFF" /> 
                      </TapControler>
                    )}
                    {Boolean(onTapMore) && _renderMore()}
                  </View>
                </Animated.View>
                <Animated.View
                  style={[
                    controlStyle.group,
                    styles.topControls,
                    styles.topFullscreenControls,
                    topFullscreenControlStyle,
                  ]}
                  pointerEvents={isFullScreenState ? 'auto' : 'none'}>
                  <View style={controlStyle.line}>
                    {Boolean(onTapBack) && _renderFullScreenBack()}
                    <Text  h5 numberOfLines={1} style={styles.headerBarTitle} color={palette.W(1)}>{headerBarTitle}</Text>
                  </View>
                  <View style={controlStyle.line}>
                    {Boolean(onToggleAutoPlay) && (
                      <Animated.View
                        style={[controlStyle.autoPlayText, autoPlayTextStyle]}>
                        <Text t4 color={'#fff'}>
                            {
                                allowAutoPlayVideo
                                ? onAutoPlayText
                                : offAutoPlayText
                            }
                        </Text>
                      </Animated.View>
                    )}
                    {Boolean(onToggleAutoPlay) && (
                      <TapControler
                        onPress={toggleAutoPlay}
                        style={controlStyle.autoPlay}> 
                          <Icon icon="play" size={25} color="#FFF" />

                      </TapControler>
                    )}
                    {Boolean(onTapMore) && _renderMore()}
                  </View>
                </Animated.View>
                <View style={controlStyle.pauseView}>
                  <TapControler
                    onPress={onPauseTapHandler}
                    style={controlStyle.pause}> 
                      <Icon icon="play" size={25} color="#FFF" />
                  </TapControler>
                </View>
                <Animated.View
                  style={[
                    controlStyle.group,
                    controlStyle.bottomControls,
                    bottomControlStyle,
                  ]}>
                  <View
                    style={[controlStyle.bottomControlGroup, controlStyle.row]}>
                    <TapControler onPress={toggleTimer}>
                      <Text style={controlStyle.timerText}>
                        <Text
                          style={controlStyle.timerText}
                          color={palette.W(1)} 
                          t3
                        >
                           { calculateTime()}
                        </Text>
                        <Text
                          style={controlStyle.timerText}
                          color={palette.W(1)} 
                          t3
                        >{` / ${formatTimeToMins(duration)}`}</Text>
                      </Text>
                    </TapControler>
                    <TapControler
                      onPress={toggleFullScreen}
                      style={controlStyle.fullToggle}>
                      {renderFullScreen ? (
                        renderFullScreen()
                      ) : ( 
                        <Icon icon="fullscreen" size={25} color="#FFF" />

                      )}
                    </TapControler>
                  </View>
                  <Animated.View
                    style={[
                      {
                        width:
                          height -
                          insetsRef.current.top -
                          insetsRef.current.bottom -
                          40,
                      },
                      fullScreenSliderStyle,
                    ]}>
                    {duration > 0 && (
                      <Slider
                        theme={theme}
                        progress={progress}
                        onSlidingComplete={onSlidingComplete}
                        onSlidingStart={onSlidingStart}
                        minimumValue={min}
                        maximumValue={max}
                        isScrubbing={isScrubbing}
                        bubble={secondToTime}
                        disableTapEvent
                        onTap={onTapSlider}
                        thumbScaleValue={controlViewOpacity}
                        thumbWidth={8}
                        sliderHeight={2}
                        {...sliderProps}
                      />
                    )}
                  </Animated.View>
                </Animated.View>
              </Animated.View>
              
              {/* <Ripple
                ref={rippleLeft}
                onAnimationEnd={() => {
                  doubleLeftOpacity.value = 0;
                }}
                style={[controlStyle.doubleTap, controlStyle.leftDoubleTap]}
                containerStyle={[{ width: leftDoubleTapBoundary }]}>
                <Animated.View style={getDoubleLeftStyle}>
                 
                   <Icon icon="backward" size={25} color="#FFF" />
                  <Text center color={palette.W(1)} t5 >10s</Text>
                </Animated.View>
              </Ripple>

              <Ripple
                ref={rippleRight}
                onAnimationEnd={() => {
                  doubleRightOpacity.value = 0;
                }}
                style={[
                  controlStyle.doubleTap,
                  controlStyle.rightDoubleTapContainer,
                ]}
                containerStyle={[{ width: leftDoubleTapBoundary }]}>
                <Animated.View style={getDoubleRightStyle}>
                 
                  <Icon icon="backward" size={25} color="#FFF" />
                  <Text center color={palette.W(1)}>10s</Text>
                </Animated.View>
              </Ripple> */}


              <Animated.View style={[styles.slider, bottomSliderStyle]}>
                {duration > 0 && (
                  <Slider
                    theme={theme}
                    progress={progress}
                    onSlidingComplete={onSlidingComplete}
                    onSlidingStart={onSlidingStart}
                    minimumValue={min}
                    maximumValue={max}
                    isScrubbing={isScrubbing}
                    bubble={(value) => {
                      return secondToTime(value);
                    }}
                    disableTapEvent
                    onTap={onTapSlider}
                    thumbScaleValue={controlViewOpacity}
                    thumbWidth={12}
                    sliderHeight={2}
                    {...sliderProps}
                  />
                )}
              </Animated.View>
            </Animated.View>

            {isIos && (
              <View
                style={[styles.stopBackView, { left: -insets.left }]}
                pointerEvents={isFullScreenState ? 'auto' : 'none'}
              />
            )}
          </Animated.View>
        </GestureDetector>
      </>
    );
  },
);
VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;

const styles = StyleSheet.create({
  controlView: {
    backgroundColor: 'rgba(0,0,0,.6)',
    justifyContent: 'center',
    overflow: 'hidden',
    ...StyleSheet.absoluteFillObject,
  },
  headerBarTitle: {
    marginLeft: 20,
    maxWidth: height / 2,
  },
  slider: {
    width: width,
    zIndex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  stopBackView: {
    height: '100%',
    position: 'absolute',
    width: 40,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 12,
    width: '100%',
  },
  topFullscreenControls: {
    top: 32,
  },
  video: {
    width: '100%',
    height: '100%',
  },

  back: {
    width: 16,
    height: 16,
  },

  more: {
    width: 24,
    height: 24,
  },
  container: {
    backgroundColor: palette.B(1),
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    justifyContent: 'center',
    zIndex: 10,
  },
});

const controlStyle = StyleSheet.create({
  autoPlay: {
    height: 24,
    marginRight: 32,
    width: 24,
  },
  autoPlayText: {
    marginRight: 10,
  },
  bottomControlGroup: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  bottomControls: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  fullToggle: {
    height: 20,
    width: 20,
  },
  group: {
    paddingHorizontal: 20,
  },
  line: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  pause: {
    height: 48,
    width: 48,
  },
  pauseView: {
    alignSelf: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timerText: {
    textAlign: 'right',
  },
  doubleTap: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },

  leftDoubleTap: {
    left: 0,
    borderTopRightRadius: width,
    borderBottomRightRadius: width,
  },

  rightDoubleTapContainer: {
    borderTopLeftRadius: width,
    borderBottomLeftRadius: width,
    right: 0,
  },
  backStep: {
    width: 40,
    height: 40,
  },
});