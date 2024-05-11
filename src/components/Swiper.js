import {forwardRef, useState, useCallback, useRef, useEffect, useMemo, useImperativeHandle, Fragment } from 'react';
import { FlatList as RNFlatList, I18nManager, Dimensions } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
 
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    marginVertical: height * 0.0125,
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 0,
    height: width * 0.0375,
  },
  pagination: {
    width: width * 0.0375,
    height: width * 0.0375,
    borderRadius: 25,
    marginHorizontal: width * 0.025,
  },
});

export const Pagination = ({
  size,
  paginationIndex = 0,
  scrollToIndex,
  paginationDefaultColor = "gray",
  paginationActiveColor = "white",
  paginationStyle = {},
  paginationStyleItem = {},
  paginationStyleItemActive = {},
  paginationStyleItemInactive = {},
  onPaginationSelectedIndex,
  paginationTapDisabled = false,
  e2eID = '',
}) => {
  return (
    <View style={[styles.container, paginationStyle]}>
      {Array.from({ length: size }).map((_, index) => (
        <TouchableOpacity
          key={index}
          testID={`${e2eID}_pagination_${index}`}
          style={[
            styles.pagination,
            paginationStyleItem,
            paginationIndex === index
              ? { backgroundColor: paginationActiveColor }
              : { backgroundColor: paginationDefaultColor },
            paginationIndex === index ? paginationStyleItemActive : paginationStyleItemInactive,
          ]}
          onPress={() => {
            scrollToIndex({ index });
            onPaginationSelectedIndex?.();
          }}
          disabled={paginationTapDisabled}
        />
      ))}
    </View>
  );
};


const MILLISECONDS = 1000;
const FIRST_INDEX = 0;
const ITEM_VISIBLE_PERCENT_THRESHOLD = 60;

const SwiperFlatList = forwardRef((
    {
      vertical = false,
      children,
      data = [],
      renderItem,
      renderAll = false,
      index = I18nManager.isRTL ? data.length - 1 : FIRST_INDEX,
      useReactNativeGestureHandler = false,
      // Pagination
      showPagination = false,
      PaginationComponent = Pagination,
      paginationActiveColor,
      paginationDefaultColor,
      paginationStyle,
      paginationStyleItem,
      paginationStyleItemActive,
      paginationStyleItemInactive,
      onPaginationSelectedIndex,
      paginationTapDisabled = false,
      // Autoplay
      autoplayDelay = 3,
      autoplay = false,
      autoplayLoop = false,
      autoplayLoopKeepAnimation = false,
      autoplayInvertDirection = I18nManager.isRTL,
      // Functions
      onChangeIndex,
      onMomentumScrollEnd,
      onViewableItemsChanged,
      viewabilityConfig = {},
      disableGesture = false,
      e2eID,
      ...props
    },ref) => {
    let _data = [];
    let _renderItem;

    if (children) { 
      _data = Array.isArray(children) ? children : [children];
      _renderItem = ({ item }) => item;
    } else if (data) {
      _data = data;
      _renderItem = renderItem;
    } else {
      console.error('Invalid props, `data` or `children` is required');
    }
    const size = _data.length;
 
    const _initialNumToRender = renderAll ? size : 1;
    const [currentIndexes, setCurrentIndexes] = useState({ index, prevIndex: index });
    const [ignoreOnMomentumScrollEnd, setIgnoreOnMomentumScrollEnd] = useState(false);
    const flatListElement = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(!disableGesture);

    useEffect(() => {
      setScrollEnabled(!disableGesture);
    }, [disableGesture]);

    const _onChangeIndex = useCallback(({ index: _index, prevIndex: _prevIndex }) => {
      if (_index !== _prevIndex) {
        onChangeIndex?.({ index: _index, prevIndex: _prevIndex });
      }
    }, [onChangeIndex]);


    const _scrollToIndex = useCallback((params) => {
        const { index: indexToScroll, animated = true } = params;
        const newParams = { animated, index: indexToScroll };

        setIgnoreOnMomentumScrollEnd(true);

        const next = {
          index: indexToScroll,
          prevIndex: currentIndexes.index,
        };
        if (currentIndexes.index !== next.index && currentIndexes.prevIndex !== next.prevIndex) {
          setCurrentIndexes({ index: next.index, prevIndex: next.prevIndex });
        } else if (currentIndexes.index !== next.index) {
          setCurrentIndexes((prevState) => ({ ...prevState, index: next.index }));
        } else if (currentIndexes.prevIndex !== next.prevIndex) {
          setCurrentIndexes((prevState) => ({ ...prevState, prevIndex: next.prevIndex }));
        }
 
        flatListElement?.current?.scrollToIndex(newParams);
      },
      [currentIndexes.index, currentIndexes.prevIndex],
    );
 
    useEffect(() => {
      _onChangeIndex({ index: currentIndexes.index, prevIndex: currentIndexes.prevIndex });
    }, [_onChangeIndex, currentIndexes.index, currentIndexes.prevIndex]);

    useImperativeHandle(ref, () => ({
      scrollToIndex: (item) => {
        setScrollEnabled(true);
        _scrollToIndex(item);
        setScrollEnabled(!disableGesture);
      },
      getCurrentIndex: () => currentIndexes.index,
      getPrevIndex: () => currentIndexes.prevIndex,
      goToLastIndex: () => {
        setScrollEnabled(true);
        _scrollToIndex({ index: I18nManager.isRTL ? FIRST_INDEX : size - 1 });
        setScrollEnabled(!disableGesture);
      },
      goToFirstIndex: () => {
        setScrollEnabled(true);
        _scrollToIndex({ index: I18nManager.isRTL ? size - 1 : FIRST_INDEX });
        setScrollEnabled(!disableGesture);
      },
    }));

    useEffect(() => {
      const isLastIndexEnd = autoplayInvertDirection
        ? currentIndexes.index === FIRST_INDEX
        : currentIndexes.index === _data.length - 1;
      const shouldContinuoWithAutoplay = autoplay && !isLastIndexEnd;
      let autoplayTimer;
      if (shouldContinuoWithAutoplay || autoplayLoop) {
        autoplayTimer = setTimeout(() => {
          if (_data.length < 1) {
            return;
          }
          if (!autoplay) {
            return;
          }

          const nextIncrement = autoplayInvertDirection ? -1 : +1;

          let nextIndex = (currentIndexes.index + nextIncrement) % _data.length;
          if (autoplayInvertDirection && nextIndex < FIRST_INDEX) {
            nextIndex = _data.length - 1;
          }
          const animate = !isLastIndexEnd || autoplayLoopKeepAnimation;
          _scrollToIndex({ index: nextIndex, animated: animate });
        }, autoplayDelay * MILLISECONDS);
      }
 
      return () => clearTimeout(autoplayTimer);
    }, [
      autoplay,
      currentIndexes.index,
      _data.length,
      autoplayInvertDirection,
      autoplayLoop,
      autoplayDelay,
      autoplayLoopKeepAnimation,
      _scrollToIndex,
    ]);

    const _onMomentumScrollEnd = (event) => {
      if (ignoreOnMomentumScrollEnd) {
        setIgnoreOnMomentumScrollEnd(false);
        return;
      }

      onMomentumScrollEnd?.({ index: currentIndexes.index }, event);
    };

    const _onViewableItemsChanged = useMemo(() => (params) => {
        const { changed } = params;
        const newItem = changed?.[FIRST_INDEX];
        if (newItem !== undefined) {
          const nextIndex = newItem.index;
          if (newItem.isViewable) {
            setCurrentIndexes((prevState) => ({ ...prevState, index: nextIndex }));
          } else {
            setCurrentIndexes((prevState) => ({ ...prevState, prevIndex: nextIndex }));
          }
        }
        onViewableItemsChanged?.(params);
      },
      [onViewableItemsChanged],
    );

    const flatListProps = {
      scrollEnabled,
      ref: flatListElement,
      keyExtractor: (_item, _index) => {
        const item = _item;
        const key = item?.key ?? item?.id ?? _index.toString();
        return key;
      },
      horizontal: !vertical,
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      pagingEnabled: true,
      ...props,
      onMomentumScrollEnd: _onMomentumScrollEnd,
      onScrollToIndexFailed: (info) =>
        setTimeout(() => _scrollToIndex({ index: info.index, animated: false })),
      data: _data,
      renderItem: _renderItem,
      initialNumToRender: _initialNumToRender,
      initialScrollIndex: index, 
      viewabilityConfig: {
        minimumViewTime: 200,
        itemVisiblePercentThreshold: ITEM_VISIBLE_PERCENT_THRESHOLD,
        ...viewabilityConfig,
      },
      onViewableItemsChanged: _onViewableItemsChanged,
      testID: e2eID,
    };

    // const { width, height } = useWindowDimensions();
    if (props.getItemLayout === undefined) {
      const itemDimension = vertical ? height : width;
      flatListProps.getItemLayout = (__data, ItemIndex) => ({
        length: itemDimension,
        offset: itemDimension * ItemIndex,
        index: ItemIndex,
      });
    }
  
    if (useReactNativeGestureHandler) {
      console.warn('Please remove `useReactNativeGestureHandler` and import the library like:');
      console.warn(
        "import { SwiperFlatListWithGestureHandler } from 'react-native-swiper-flatlist/WithGestureHandler';",
      );
    }

    return (
      <Fragment>
        <RNFlatList {...flatListProps} />
        {showPagination ? (
          <PaginationComponent
            size={size}
            paginationIndex={currentIndexes.index}
            scrollToIndex={(params) => void _scrollToIndex(params)}
            paginationActiveColor={paginationActiveColor}
            paginationDefaultColor={paginationDefaultColor}
            paginationStyle={paginationStyle}
            paginationStyleItem={paginationStyleItem}
            paginationStyleItemActive={paginationStyleItemActive}
            paginationStyleItemInactive={paginationStyleItemInactive}
            onPaginationSelectedIndex={onPaginationSelectedIndex}
            paginationTapDisabled={paginationTapDisabled}
            e2eID={e2eID}
          />
        ) : null}
      </Fragment>
    );
  },
);

export default SwiperFlatList

/**
 * swiper 轮播组件 flatlist实现
 * 
 * https://github.com/gusgard/react-native-swiper-flatlist
 * 
 *  <SwiperFlatList autoplay autoplayDelay={2} autoplayLoop index={2} showPagination>
      <View style={[styles.child, { backgroundColor: 'tomato' }]}>
        <Text style={styles.text}>1</Text>
      </View>
    </SwiperFlatList>
 */