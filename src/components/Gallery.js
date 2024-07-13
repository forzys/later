
import React, { memo, useMemo, useCallback, useEffect, useState, useRef } from "react";
 
import { StatusBar, Modal, SafeAreaView,  Image, TouchableOpacity,  Text, StyleSheet, useWindowDimensions, View, Dimensions, ActivityIndicator,  } from "react-native";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    FadeIn, 
} from "react-native-reanimated";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";

import { SPRING_CONFIG, DURATION, MIN_SCALE, MAX_SCALE } from "@/common/constants";
import Icon from "@/common/components/Icon";
import fetcher from "@/common/fetcher";

const useVector = (x1 = 0, y1)  => {
  const x = useSharedValue(x1);
  const y = useSharedValue(y1 ?? x1);
  return { x, y };
};

 
const TouchDownLoad = ({
  uri = '',
  icon='cloud-download',
  color = '#FFF',
  index,
})=>{

  const {current} = useRef({
    timer: null,
    index: null,
  })
  const [isDownLoading, setIsDownLoading] = useState(false);
  const [isDownLoaded, setIsDownLoaded] = useState(false);


  const close = ()=>{
    if( current.timer ){
      current.index = null
      clearTimeout(current.timer)
    } 
  }

  const withTimer = (delay)=>{ 

    close();
    current.index = index 
    current.timer = setTimeout(()=>{ 
      setIsDownLoading(false)
      setIsDownLoaded(true)

      current.timer = null
      current.index = null 
    }, delay); 
  }


  useEffect(()=>{
    return close
  },[])

  const onDownLoad = ()=>{
    if(isDownLoaded){
      return
    }

    withTimer(12 * 1000); // 12s 超时
    setIsDownLoading(true); 
    fetcher.get(uri, { session: 'img' }).then(({ path })=>{
      fetcher.MediaCollection.copyToMediaStore({
              name: path?.split('/')?.pop(), // name of the file
              parentFolder: '', // subdirectory in the Media Store, e.g. HawkIntech/Files to create a folder HawkIntech with a subfolder Files and save the image within this folder
              mimeType: 'image/png' // MIME type of the file
          },
          'Image', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
          path // Path to the file being copied in the apps own storage
      ).then((result)=>{ 
          if(result){
            setIsDownLoading(false)
            setIsDownLoaded(true)  
          }
          close()
      }).catch(e=>{
        close()
      })
    }) 
  }


  console.log({
    currentIndex: current.index ,
    index,
    isDownLoading,
  })
  
  return (
      <TouchableOpacity onPress={onDownLoad} style={{ width: 28, height: 28, justifyContent: "center", alignItems: "center" }}>
        {
          (isDownLoading && current.index === index) ? (
            <ActivityIndicator color={color} size="small" />
          ):isDownLoaded? (
              <Icon icon="download_done" color="#FFF" />
          ): <Icon icon="cloud-download" color="#FFF" size={22} />
        }
      </TouchableOpacity>
  )
}
 
const clamp = (number, min, max) => {
    "worklet";
    return Math.max(min, Math.min(number, max));
};

const rubberClamp = (x, rubberStrength, dim) => {
    "worklet";
    return (1 - 1 / ((x * rubberStrength) / dim + 1)) * dim;
};

const withRubberClamp = (x, rubberStrength, dim, min,  max ) => {
    "worklet";
    const clampedX = clamp(x, min, max);
    const diff = Math.abs(x - clampedX);
    const direction = clampedX > x ? -1 : 1;

    const _rubberStrength =
        typeof rubberStrength === "number"
        ? rubberStrength
        : direction === 1
            ? rubberStrength.dir0
            : rubberStrength.dir1;

    const result = clampedX + direction * rubberClamp(diff, _rubberStrength, dim);
    return result;
};

function ModalContainer(props) {
    return (
        <Modal
            transparent
            animationType="fade"
            presentationStyle="overFullScreen"
            visible={props.isVisible}
            onRequestClose={props.onRequestClose}
        >
            <View style={{ flex: 1, }}>{props.children}</View>
        </Modal>
    );
}

const DefaultImageComponent = (props) => {
    return (
      <Image
        source={props.source}
        resizeMode="contain"
        onLoad={(e) =>
          props.onLoad(e.nativeEvent.source.width, e.nativeEvent.source.height)
        }
        style={props.style}
      />
    );
};

const DefaultHeader = memo(({
    onClose,
    currentImageIndex,
    imagesLength,
    isFocused,
    isDownLoad, 
    item,
  }) => {
    if (!isFocused) {
      return null;
    }

    return (
      <Animated.View entering={FadeIn} style={styles.Header.container}>
        <SafeAreaView style={styles.Header.safeArea}>
          <View style={styles.Header.wrapper}>
            <View style={styles.Header.closeButtonWrapper}>
              <TouchableOpacity onPress={onClose} style={styles.Header.closeButton}> 
                <Icon icon="close" color="#FFF" />
              </TouchableOpacity>
            </View>


            <View style={styles.Header.titleWrapper}>
              <Text style={styles.Header.title}>
                {currentImageIndex + 1}/{imagesLength}
              </Text>
            </View>


            <View style={styles.Header.right}>
              <TouchDownLoad uri={item?.uri} index={currentImageIndex} />
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  },
);
 
const GalleryItem = memo(({
    item,
    index,
    currentIndex,
    isFirst,
    isLast,
    rootTranslateX,
    opacity,
    dataLength,
    width,
    height,
    gap,
    onClose,
    setIsFocused,
    isFocused,
    ImageComponent,
    maxScale,
    springConfig,
  }) => {
    const [imageDimensions, setImageDimensions] = useState({
      width: Dimensions.get("screen").width,
      height: Dimensions.get("screen").height,
    });
    const contentContainerSize = useMemo(() => {
      return {
        width: width,
        height: (imageDimensions.height * width) / imageDimensions.width,
      };
    }, [width, imageDimensions.height, imageDimensions.width]);

    const contentCenterX = contentContainerSize.width / 2;
    const contentCenterY = contentContainerSize.height / 2;

    const initRootTranslateX = useSharedValue(0);

    const offset = useVector(0, 0);

    const translation = useVector(0, 0);
    const savedTranslation = useVector(0, 0);

    const initialFocal = useVector(0, 0);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const isPanningOut = useSharedValue(false);
    const shouldClose = useSharedValue(false);

    const animationContentContainerStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: offset.x.value + translation.x.value },
          { translateY: offset.y.value + translation.y.value },
          { scale: scale.value },
        ],
      };
    });

    const onStartInteraction = () => {
      "worklet";
      offset.x.value = offset.x.value + translation.x.value;
      offset.y.value = offset.y.value + translation.y.value;

      translation.x.value = 0;
      translation.y.value = 0;

      runOnJS(setIsFocused)(false);
    };

    const getImagePositionX = useCallback((i)=> {
        "worklet"; 
        return [-(width + gap) * i, -width * (i + 1)];
      },
      [gap, width],
    );

    const getScaledEdgesX = (scaleValue) => {
      "worklet";
      const _scale = scaleValue !== undefined ? scaleValue : scale.value;
      const scaledWith = _scale * contentContainerSize.width;
      const xPoint = Math.abs((scaledWith - width) / 2);

      return [-xPoint, xPoint];
    };

    const getScaledEdgesY = (scaleValue ) => {
      "worklet";
      const _scale = scaleValue !== undefined ? scaleValue : scale.value;
      const scaledHeight = _scale * contentContainerSize.height;
      const yPoint = Math.abs((scaledHeight - height) / 2);

      return [-yPoint, yPoint];
    };

    const reset = () => {
      "worklet";
      translation.x.value =
        scale.value > 1
          ? withTiming(0, { duration: DURATION })
          : withSpring(0, springConfig);
      translation.y.value =
        scale.value > 1
          ? withTiming(0, { duration: DURATION })
          : withSpring(0, springConfig);
      offset.x.value =
        scale.value > 1
          ? withTiming(0, { duration: DURATION })
          : withSpring(0, springConfig);
      offset.y.value =
        scale.value > 1
          ? withTiming(0, { duration: DURATION })
          : withSpring(0, springConfig);
      opacity.value = withTiming(1, { duration: DURATION });
      scale.value = withTiming(1, { duration: DURATION });
      rootTranslateX.value = withSpring(
        getImagePositionX(index)[0],
        springConfig,
      );
    };

    const pinchGesture = Gesture.Pinch()
      .onStart((event) => {
        onStartInteraction();
        initialFocal.x.value = event.focalX - (width / 2 + offset.x.value);
        initialFocal.y.value = event.focalY - (height / 2 + offset.y.value);
        savedScale.value = scale.value;
      })
      .onUpdate((event) => {
        if (event.numberOfPointers !== 2) return;
        const deltaX = event.focalX - (width / 2 + offset.x.value);
        const deltaY = event.focalY - (height / 2 + offset.y.value);

        translation.x.value =
          deltaX +
          ((-1 * scale.value) / savedScale.value) * initialFocal.x.value;
        translation.y.value =
          deltaY +
          ((-1 * scale.value) / savedScale.value) * initialFocal.y.value;

        scale.value = withRubberClamp(
          savedScale.value * event.scale,
          0.45,
          maxScale,
          MIN_SCALE,
          maxScale,
        );
      })
      .onEnd(() => {
        if (scale.value <= 1) {
          reset();
        } else {
          if (scale.value > maxScale) {
            const diffX =
              ((-1 * maxScale) / savedScale.value) * initialFocal.x.value -
              ((-1 * scale.value) / savedScale.value) * initialFocal.x.value;

            const diffY =
              ((-1 * maxScale) / savedScale.value) * initialFocal.y.value -
              ((-1 * scale.value) / savedScale.value) * initialFocal.y.value;

            translation.x.value = withTiming(translation.x.value + diffX, {
              duration: DURATION,
            });
            translation.y.value = withTiming(translation.y.value + diffY, {
              duration: DURATION,
            });
            scale.value = withTiming(maxScale, {
              duration: DURATION,
            });
          } else {
            const edgesX = getScaledEdgesX();
            const edgesY = getScaledEdgesY();

            if (offset.x.value + translation.x.value > edgesX[1]) {
              translation.x.value = withSpring(
                edgesX[1] - offset.x.value,
                springConfig,
              );
            } else if (offset.x.value + translation.x.value < edgesX[0]) {
              translation.x.value = withSpring(
                edgesX[0] - offset.x.value,
                springConfig,
              );
            }

            const currHeight = contentContainerSize.height * scale.value;
            if (currHeight > height) {
              if (offset.y.value + translation.y.value > edgesY[1]) {
                translation.y.value = withSpring(
                  edgesY[1] - offset.y.value,
                  springConfig,
                );
              } else if (offset.y.value + translation.y.value < edgesY[0]) {
                translation.y.value = withSpring(
                  edgesY[0] - offset.y.value,
                  springConfig,
                );
              }
            } else {
              translation.y.value = withSpring(0, springConfig);
              offset.y.value = withSpring(0, springConfig);
            }
          }
        }
      });

    const panGesture = Gesture.Pan()
      .minDistance(10)
      .maxPointers(1)
      .onStart(() => {
        onStartInteraction();
        initRootTranslateX.value = rootTranslateX.value;
        savedTranslation.x.value = translation.x.value;
        savedTranslation.y.value = translation.y.value;
        isPanningOut.value = false;
        shouldClose.value = false;
      })
      .onUpdate((event) => {
        const { translationX, translationY, velocityY, velocityX } = event;
        const edgesX = getScaledEdgesX();
        const edgesY = getScaledEdgesY();

        isPanningOut.value = !isPanningOut.value
          ? scale.value === 1 &&
            getImagePositionX(index)[0] === rootTranslateX.value &&
            ((velocityY > 0 && velocityY > Math.abs(velocityX)) ||
              translationY > Math.abs(translationX))
          : isPanningOut.value;

        if (scale.value === 1 && !isPanningOut.value) {
          rootTranslateX.value = withRubberClamp(
            initRootTranslateX.value + translationX,
            { dir0: isFirst ? 0.55 : 1.15, dir1: isLast ? 0.55 : 1.15 },
            width,
            getImagePositionX(dataLength - 1)[0],
            0,
          );
          return;
        } else {
          translation.x.value = withRubberClamp(
            savedTranslation.x.value + translationX,
            0.55,
            contentContainerSize.width * scale.value,
            edgesX[0],
            edgesX[1],
          );
        }

        if (isPanningOut.value) {
          if (
            translation.y.value === 0 &&
            Math.abs(velocityY) > Math.abs(velocityX) &&
            velocityY > height
          ) {
            shouldClose.value = true;
            runOnJS(onClose)();
            return;
          }

          translation.y.value = withRubberClamp(
            savedTranslation.y.value + translationY,
            { dir0: 1, dir1: 0.55 },
            contentContainerSize.height * scale.value,
            0,
            edgesY[1],
          );
          opacity.value = interpolate(
            translation.y.value,
            [0, height / 2],
            [1, 0],
          );
          scale.value = interpolate(
            translation.y.value,
            [0, height / 2],
            [1, 0.66],
          );
          shouldClose.value =
            velocityY >= 0 && translation.y.value > contentCenterY / 2;
        } else {
          translation.y.value = withRubberClamp(
            savedTranslation.y.value + translationY,
            0.55,
            contentContainerSize.height * scale.value,
            edgesY[0],
            edgesY[1],
          );
        }
      })
      .onEnd((event) => {
        if (shouldClose.value) {
          runOnJS(onClose)();
          return;
        } else if (isPanningOut.value) {
          reset();
          return;
        }

        const currentImagePositionX = getImagePositionX(index);
        const { velocityX, translationX } = event;
        const edgesX = getScaledEdgesX();
        const edgesY = getScaledEdgesY();

        if (scale.value === 1) {
          const needToTransX = Math.abs(getImagePositionX(1)[0] / 2);

          if ((isFirst && translationX > 0) || (isLast && translationX < 0)) {
            rootTranslateX.value = withSpring(
              currentImagePositionX[0],
              springConfig,
            );
          } else if (
            Math.abs(velocityX) >= needToTransX ||
            Math.abs(translationX) >= needToTransX
          ) {
            const newIndex =
              !isFirst && velocityX >= 0 && translationX > 0
                ? index - 1
                : !isLast && velocityX <= 0 && translationX < 0
                  ? index + 1
                  : index;
            const newPosition = getImagePositionX(newIndex);
            rootTranslateX.value = withSpring(newPosition[0], springConfig);
            currentIndex.value = newIndex;
          } else {
            rootTranslateX.value = withSpring(
              currentImagePositionX[0],
              springConfig,
            );
          }
        } else {
          if (
            translation.x.value + offset.x.value > edgesX[1] ||
            translation.x.value + offset.x.value < edgesX[0]
          ) {
            translation.x.value = withSpring(
              clamp(
                translation.x.value,
                edgesX[0] - offset.x.value,
                edgesX[1] - offset.x.value,
              ),
              springConfig,
            );
          }

          if (
            translation.y.value + offset.y.value > edgesY[1] ||
            translation.y.value + offset.y.value < edgesY[0]
          ) {
            translation.y.value = withSpring(
              clamp(
                translation.y.value,
                edgesY[0] - offset.y.value,
                edgesY[1] - offset.y.value,
              ),
              springConfig,
            );
          }
        }
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        onStartInteraction();
      })
      .onEnd((event) => {
        if (scale.value > 1) {
          reset();
        } else {
          const zoomScale = Math.min(
            contentContainerSize.width > contentContainerSize.height
              ? (height / contentContainerSize.height) * 1.1
              : 2.5,
            maxScale,
          );

          const edgesX = getScaledEdgesX(zoomScale);
          const edgesY = getScaledEdgesY(zoomScale);

          translation.x.value = withTiming(
            clamp(
              (contentCenterX - event.x) * (zoomScale - 1),
              edgesX[0],
              edgesX[1],
            ),
            { duration: DURATION },
          );

          translation.y.value = withTiming(
            clamp(
              (contentCenterY - event.y) * (zoomScale - 1),
              edgesY[0],
              edgesY[1],
            ),
            { duration: DURATION },
          );

          scale.value = withTiming(zoomScale, { duration: DURATION });
          savedScale.value = zoomScale;
        }
      });

    const tap = Gesture.Tap()
      .numberOfTaps(1)
      .requireExternalGestureToFail(doubleTap)
      .onEnd(() => {
        runOnJS(setIsFocused)(!isFocused);
      });

    const gestures = Gesture.Exclusive(
      Gesture.Race(panGesture, pinchGesture),
      tap,
    );

    return (
      <View style={styles.wrapperItem}>
        <GestureDetector gesture={gestures}>
          <View style={styles.containerItem}>
            <Animated.View style={animationContentContainerStyle}>
              <GestureDetector gesture={doubleTap}>
                <ImageComponent
                  source={item}
                  onLoad={(imageWidth, imageHeight) => {
                    setImageDimensions({
                      width: imageWidth,
                      height: imageHeight,
                    });
                  }}
                  style={contentContainerSize}
                />
              </GestureDetector>
            </Animated.View>
          </View>
        </GestureDetector> 
      </View>
    );
  },
);

const GalleryPreview = ({
    images,
    isVisible,
    onRequestClose,
    initialIndex = 0,
    gap = 24,
    simultaneousRenderedImages = 6,
    HeaderComponent = DefaultHeader,
    ImageComponent = DefaultImageComponent,
    springConfig = SPRING_CONFIG,
    maxScale = MAX_SCALE,
    isDownLoad,
}) => {
  const dimensions = useWindowDimensions();

  const [index, setIndex] = useState(initialIndex);
  const [isFocused, setIsFocused] = useState(true);

  const translateX = useSharedValue(initialIndex * -(dimensions.width + gap));
  const opacity = useSharedValue(1);
  const currentIndex = useSharedValue(initialIndex);

  const changeIndex = useCallback((newIndex) => {
    setIndex(newIndex);
  }, []);

  useAnimatedReaction(
    () => currentIndex.value,
    (newIndex) => runOnJS(changeIndex)(newIndex),
    [currentIndex, changeIndex],
  );

  const wrapperAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
    }),
    [isFocused],
  );

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isImageVisible = useCallback(
    (imageIndex) => {
      const halfVisible = Math.floor(simultaneousRenderedImages / 2);
      const start = Math.max(0, imageIndex - halfVisible);
      const end = Math.min(
        images.length - 1,
        start + simultaneousRenderedImages - 1,
      );
      return imageIndex >= start && imageIndex <= end;
    },
    [images.length, simultaneousRenderedImages],
  );

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => changeIndex(initialIndex), 200);
      translateX.value = initialIndex * -(dimensions.width + gap);
      opacity.value = 1;
    }
  }, [
    changeIndex,
    dimensions.width,
    gap,
    initialIndex,
    isVisible,
    opacity,
    translateX,
  ]); 

  return (
    <ModalContainer isVisible={isVisible} onRequestClose={onRequestClose}>
      <StatusBar hidden={!isFocused} translucent />
      <Animated.View style={[wrapperAnimatedStyle, styles.wrapper]}>
        <GestureHandlerRootView style={styles.gestureContainer}>
          <Animated.View
            style={[
              containerAnimatedStyle,
              styles.container,
              { columnGap: gap },
            ]}
          >
            {images.map((image, i) => {
              const visible = isImageVisible(i);
              return (
                <View key={i} style={{ ...dimensions }}>
                  {visible && (
                    <GalleryItem
                      item={image}
                      index={i}
                      currentIndex={currentIndex}
                      isFirst={i === 0}
                      isLast={i === images.length - 1}
                      rootTranslateX={translateX}
                      opacity={opacity}
                      width={dimensions.width}
                      height={dimensions.height}
                      dataLength={images.length}
                      gap={gap}
                      onClose={onRequestClose}
                      isFocused={isFocused}
                      setIsFocused={setIsFocused}
                      ImageComponent={ImageComponent}
                      springConfig={springConfig}
                      maxScale={maxScale}
                    />
                  )}
                </View>
              );
            })}
          </Animated.View>
        </GestureHandlerRootView>
        <HeaderComponent
          isFocused={isFocused}
          imagesLength={images.length}
          currentImageIndex={index}
          item={images?.[index]}
          onClose={onRequestClose}
          isDownLoad={isDownLoad}
        />
      </Animated.View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
    wrapperItem: {
        flex: 1,
        backgroundColor: "#000",
      },
      containerItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      },
  wrapper: { flex: 1, backgroundColor: "#000" },
  gestureContainer: { flex: 1 },
  container: { flexDirection: "row" },
 

  Header:{
      container: {
        width: "100%",
        top: 0,
        position: "absolute",
        backgroundColor: "rgb(0, 0, 0)",
      },
      safeArea: {
        flex: 1,
        backgroundColor: "rgb(0, 0, 0)",
      },
      wrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 54,
      },

      titleWrapper: {
        flex: 3,
      },
      title: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 2,
        color: "#fff",
      },
      closeButtonWrapper: {
        flex: 1,
        paddingLeft: 16,
      },
      closeButton: {
        width: 28,
        height: 28,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
      },
      closeButtonIcon: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
      },
      right: {
        flex: 1,  
        alignItems:'flex-end',
        paddingRight: 16,
      },
  }

});

export default GalleryPreview
