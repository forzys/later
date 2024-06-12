import React, {Component, cloneElement} from 'react';
import {ScrollView,Animated, View, StyleSheet,PanResponder, Platform, RefreshControl} from 'react-native';

function shallowEqual(objA, objB) {
    if (objA === objB) {
      return true
    }
  
    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)
  
    if (keysA.length !== keysB.length) {
      return false
    }
   
    const hasOwn = Object.prototype.hasOwnProperty
    for (let i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i]) ||
          objA[keysA[i]] !== objB[keysA[i]]) {
        return false
      }
    }
  
    return true
}
function swapArrayElements(array, indexA, indexB) {
    if (indexA === indexB) {
      return array;
    }
  
    if (indexA > indexB) {
      [indexA, indexB] = [indexB, indexA];
    }
  
    return [
      ...array.slice(0, indexA),
      array[indexB],
      ...array.slice(indexA + 1, indexB),
      array[indexA],
      ...array.slice(indexB + 1),
    ];
} 

class Row extends Component {
  
  static defaultProps = {
    location: {x: 0, y: 0},
    activationTime: 200,
  };

  constructor(props) {
    super(props);

    this._animatedLocation = new Animated.ValueXY(props.location);
    this._location = props.location;

    this._animatedLocation.addListener(this._onChangeLocation);
  }

  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !this._isDisabled(),

    onMoveShouldSetPanResponder: (e, gestureState) => {
      if (this._isDisabled()) return false;

      const vy = Math.abs(gestureState.vy)
      const vx = Math.abs(gestureState.vx)

      return this._active && (this.props.horizontal ? vx > vy : vy > vx);
    },

    onShouldBlockNativeResponder: () => false,

    onPanResponderGrant: (e, gestureState) => {
      e.persist();

      this._target = e.nativeEvent.target;
      this._prevGestureState = {
        ...gestureState,
        moveX: gestureState.x0,
        moveY: gestureState.y0,
      };

      if (this.props.manuallyActivateRows) return;

      this._longPressTimer = setTimeout(() => {
        if (this._active) return;

        this._toggleActive(e, gestureState);
      }, this.props.activationTime);
    },

    onPanResponderMove: (e, gestureState) => {
      if (
        !this._active ||
        gestureState.numberActiveTouches > 1 ||
        e.nativeEvent.target !== this._target
      ) {
        if (!this._isTouchInsideElement(e)) {
          this._cancelLongPress();
        }

        return;
      }

      const elementMove = this._mapGestureToMove(this._prevGestureState, gestureState);
      this.moveBy(elementMove);
      this._prevGestureState = {...gestureState};

      if (this.props.onMove) {
        this.props.onMove(e, gestureState, this._nextLocation);
      }
    },

    onPanResponderRelease: (e, gestureState) => {
      if (this._active) {
        this._toggleActive(e, gestureState);

      } else {
        this._cancelLongPress();

        if (this._isTouchInsideElement(e) && this.props.onPress) {
          this.props.onPress();
        }
      }
    },

    onPanResponderTerminationRequest: () => {
      if (this._active) { 
        return false;
      }

      this._cancelLongPress();

      return true;
    },

    onPanResponderTerminate: (e, gestureState) => {
      this._cancelLongPress(); 
      if (this._active) {
        this._toggleActive(e, gestureState);

        if (shallowEqual(this.props.location, this._location)) {
          this._relocate(this.props.location);
        }
      }
    },
  });

  componentDidUpdate() {
    if (!this._active && !shallowEqual(this._location, this.props.location)) {
      const animated = !this._active && this.props.animated;
      this._relocate(this.props.location, animated);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.disabled !== nextProps.disabled ||
           this.props.children !== nextProps.children ||
           !shallowEqual(this.props.style, nextProps.style);
  }

  moveBy({dx = 0, dy = 0, animated = false}) {
    this._nextLocation = {
      x: this._location.x + dx,
      y: this._location.y + dy,
    };
    this._relocate(this._nextLocation, animated);
  }

  render() {
    const {children, style, horizontal} = this.props;
    const rowStyle = [
      style, {position: 'absolute'}, this._animatedLocation.getLayout(),
      horizontal ? { top: 0, bottom: 0 } : { left: 0, right: 0 },
    ];

    return (
      <Animated.View
        {...this._panResponder.panHandlers}
        style={rowStyle}
        onLayout={this._onLayout}>
        {this.props.manuallyActivateRows && children
          ? cloneElement(children, {
            toggleRowActive: this._toggleActive,
          })
          : children
        }
      </Animated.View>
    );
  }

  _cancelLongPress() {
    clearTimeout(this._longPressTimer);
  }

  _relocate(nextLocation, animated) {
    this._location = nextLocation;

    if (animated) {
      this._isAnimationRunning = true;
      Animated.timing(this._animatedLocation, {
        toValue: nextLocation,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        this._isAnimationRunning = false;
      });
    } else {
      this._animatedLocation.setValue(nextLocation);
    }
  }

  _toggleActive = (e, gestureState) => {
    const callback = this._active ? this.props.onRelease : this.props.onActivate;

    this._active = !this._active;

    if (callback) {
      callback(e, gestureState, this._location);
    }
  };

  _mapGestureToMove(prevGestureState, gestureState) {
    return this.props.horizontal
      ? {dx: gestureState.moveX - prevGestureState.moveX}
      : {dy: gestureState.moveY - prevGestureState.moveY};
  }

  _isDisabled() {
      return this.props.disabled ||
        this._isAnimationRunning;
    }

  _isTouchInsideElement({nativeEvent}) {
    return this._layout &&
      nativeEvent.locationX >= 0 &&
      nativeEvent.locationX <= this._layout.width &&
      nativeEvent.locationY >= 0 &&
      nativeEvent.locationY <= this._layout.height;
  }

  _onChangeLocation = (value) => {
    this._location = value;
  };

  _onLayout = (e) => {
      this._layout = e.nativeEvent.layout;

      if (this.props.onLayout) {
          this.props.onLayout(e);
      }
  };
}

const AUTOSCROLL_INTERVAL = 100;
const ZINDEX = Platform.OS === 'ios' ? 'zIndex' : 'elevation';

function uniqueRowKey(key) {
  return `${key}${uniqueRowKey.id}`
}

uniqueRowKey.id = 0
  

export default class SortableList extends Component {
   
  static defaultProps = {
    sortingEnabled: true,
    scrollEnabled: true,
    keyboardShouldPersistTaps: 'never',
    autoscrollAreaSize: 60,
    snapToAlignment: 'start',
    manuallyActivateRows: false,
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: true,
    scrollEventThrottle: 2,
    decelerationRate: 'normal',
    pagingEnabled: false,
    onScroll: () => {}
  } 
  _rows = {}; 
  _rowsLayouts = {};
  _resolveRowLayout = {}; 
  _contentOffset = {x: 0, y: 0};

  state = {
    animated: false,
    order: this.props.order || Object.keys(this.props.data),
    rowsLayouts: null,
    containerLayout: null,
    data: this.props.data,
    isMounting: true,
    activeRowKey: null,
    activeRowIndex: null,
    releasedRowKey: null,
    sortingEnabled: this.props.sortingEnabled,
    scrollEnabled: this.props.scrollEnabled
  };

  componentDidMount() {
    this.state.order.forEach((key) => {
      this._rowsLayouts[key] = new Promise((resolve) => {
        this._resolveRowLayout[key] = resolve;
      });
    });

    if (this.props.renderHeader && !this.props.horizontal) {
      this._headerLayout = new Promise((resolve) => {
        this._resolveHeaderLayout = resolve;
      });
    }
    if (this.props.renderFooter && !this.props.horizontal) {
      this._footerLayout = new Promise((resolve) => {
        this._resolveFooterLayout = resolve;
      });
    }

    this._onUpdateLayouts();

    this.setState({ isMounting: false });
  }

  componentDidUpdate(prevProps, prevState) {
    const {data: currentData, order: currentOrder, scrollEnabled} = this.state;
    const {data: prevData} = prevState;
    let {data: nextData, order: nextOrder} = this.props;

    if (currentData && nextData && !shallowEqual(currentData, nextData)) {
      nextOrder = nextOrder || Object.keys(nextData)
      uniqueRowKey.id++;
      this._rowsLayouts = {};
      nextOrder.forEach((key) => {
        this._rowsLayouts[key] = new Promise((resolve) => {
          this._resolveRowLayout[key] = resolve;
        });
      });

      if (Object.keys(nextData).length > Object.keys(currentData).length) {
        this.setState({
          animated: false,
          data: nextData,
          containerLayout: null,
          rowsLayouts: null,
          order: nextOrder
        });
      } else {
        this.setState({
          data: nextData,
          order: nextOrder
        });
      }

    } else if (currentOrder && nextOrder && !shallowEqual(currentOrder, nextOrder)) {
      this.setState({order: nextOrder});
    }

    if (currentData && prevData && !shallowEqual(currentData, prevData)) {
      this._onUpdateLayouts();
    }
  }

  scrollBy({dx = 0, dy = 0, animated = false}) {
    if (this.props.horizontal) {
      this._contentOffset.x += dx;
    } else {
      this._contentOffset.y += dy;
    }

    this._scroll(animated);
  }

  scrollTo({x = 0, y = 0, animated = false}) {
    if (this.props.horizontal) {
      this._contentOffset.x = x;
    } else {
      this._contentOffset.y = y;
    }

    this._scroll(animated);
  }

  scrollToRowKey({key, animated = false}) {
    const {order, containerLayout, rowsLayouts} = this.state;

    let keyX = 0;
    let keyY = 0;

    for (const rowKey of order) {
      if (rowKey === key) {
          break;
      }

      keyX += rowsLayouts[rowKey].width;
      keyY += rowsLayouts[rowKey].height;
    }
 
    if (
      this.props.horizontal
        ? (keyX < this._contentOffset.x || keyX > this._contentOffset.x + containerLayout.width)
        : (keyY < this._contentOffset.y || keyY > this._contentOffset.y + containerLayout.height)
    ) {
      if (this.props.horizontal) {
        this._contentOffset.x = keyX;
      } else {
        this._contentOffset.y = keyY;
      }

      this._scroll(animated);
    }
  }

  render() {
    if (this.state.isMounting ) return null;

    let {
      contentContainerStyle,
      innerContainerStyle,
      horizontal,
      style,
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      snapToAlignment,
      scrollEventThrottle,
      decelerationRate,
      pagingEnabled,
      nestedScrollEnabled,
      disableIntervalMomentum,
      keyboardShouldPersistTaps,
    } = this.props;
    const {animated, contentHeight, contentWidth, scrollEnabled} = this.state;
    const containerStyle = StyleSheet.flatten([style, {opacity: Number(animated)}])
    innerContainerStyle = [
      { flex: 1, zIndex: 1 },
      horizontal ? {width: contentWidth} : {height: contentHeight},
      innerContainerStyle
    ];
    let {refreshControl} = this.props;

    if (refreshControl && refreshControl.type === RefreshControl) {
      refreshControl = React.cloneElement(this.props.refreshControl, {
        enabled: scrollEnabled, // fix for Android
      });
    }

    return (
      <View style={containerStyle} ref={this._onRefContainer}>
        <ScrollView
          nestedScrollEnabled={nestedScrollEnabled}
          disableIntervalMomentum={disableIntervalMomentum}
          refreshControl={refreshControl}
          ref={this._onRefScrollView}
          horizontal={horizontal}
          contentContainerStyle={contentContainerStyle}
          scrollEventThrottle={scrollEventThrottle}
          pagingEnabled={pagingEnabled}
          decelerationRate={decelerationRate}
          scrollEnabled={scrollEnabled}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          snapToAlignment={snapToAlignment}
          onScroll={this._onScroll}
        >
          {this._renderHeader()}
          <View style={innerContainerStyle}>
            {this._renderRows()}
          </View>
          {this._renderFooter()}
        </ScrollView>
      </View>
    );
  }

  _renderRows() {
    const {horizontal, rowActivationTime, sortingEnabled, renderRow} = this.props;
    const {animated, order, data, activeRowKey, releasedRowKey, rowsLayouts} = this.state;
 
    let nextX = 0;
    let nextY = 0;

    return order.map((key, index) => {
      const style = {[ZINDEX]: 0};
      const location = {x: 0, y: 0};

      if (rowsLayouts) {
        if (horizontal) {
          location.x = nextX;
          nextX += rowsLayouts[key] ? rowsLayouts[key].width : 0;
        } else {
          location.y = nextY;
          nextY += rowsLayouts[key] ? rowsLayouts[key].height : 0;
        }
      }

      const active = activeRowKey === key;
      const released = releasedRowKey === key;

      if (active || released) {
        style[ZINDEX] = 100;
      }

      return (
        <Row
          key={uniqueRowKey(key)}
          ref={this._onRefRow.bind(this, key)}
          horizontal={horizontal}
          activationTime={rowActivationTime}
          animated={animated && !active}
          disabled={!sortingEnabled}
          style={style}
          location={location}
          onLayout={!rowsLayouts ? this._onLayoutRow.bind(this, key) : null}
          onActivate={this._onActivateRow.bind(this, key, index)}
          onPress={this._onPressRow.bind(this, key)}
          onRelease={this._onReleaseRow.bind(this, key)}
          onMove={this._onMoveRow}
          manuallyActivateRows={this.props.manuallyActivateRows}>
          {renderRow({
            key,
            data: data[key],
            disabled: !sortingEnabled,
            active,
            index,
          })}
        </Row>
      );
    });
  }

  _renderHeader() {
    if (!this.props.renderHeader || this.props.horizontal) {
      return null;
    }

    const {headerLayout} = this.state;

    return (
      <View onLayout={!headerLayout ? this._onLayoutHeader : null}>
        {this.props.renderHeader()}
      </View>
    );
  }

  _renderFooter() {
    if (!this.props.renderFooter || this.props.horizontal) {
      return null;
    }

    const {footerLayout} = this.state;

    return (
      <View onLayout={!footerLayout ? this._onLayoutFooter : null}>
        {this.props.renderFooter()}
      </View>
    );
  }

  _onUpdateLayouts() {
    Promise.all([this._headerLayout, this._footerLayout, ...Object.values(this._rowsLayouts)])
      .then(([headerLayout, footerLayout, ...rowsLayouts]) => {
        // Can get correct container’s layout only after rows’s layouts.
        this._container.measure((x, y, width, height, pageX, pageY) => {
          const rowsLayoutsByKey = {};
          let contentHeight = 0;
          let contentWidth = 0;

          rowsLayouts.forEach(({rowKey, layout}) => {
            rowsLayoutsByKey[rowKey] = layout;
            contentHeight += layout.height;
            contentWidth += layout.width;
          });

          this.setState({
            containerLayout: {x, y, width, height, pageX, pageY},
            rowsLayouts: rowsLayoutsByKey,
            headerLayout,
            footerLayout,
            contentHeight,
            contentWidth,
          }, () => {
            this.setState({animated: true});
          });
        });
      });
  }

  _scroll(animated) {
    this._scrollView.scrollTo({...this._contentOffset, animated});
  }

  
  _setOrderOnMove() {
    const {activeRowKey, activeRowIndex, order} = this.state;

    if (activeRowKey === null || this._autoScrollInterval) {
      return;
    }

    let {
      rowKey: rowUnderActiveKey,
      rowIndex: rowUnderActiveIndex,
    } = this._findRowUnderActiveRow();

    if (this._movingDirectionChanged) {
      this._prevSwapedRowKey = null;
    }

    // Swap rows if necessary.
    if (rowUnderActiveKey !== activeRowKey && rowUnderActiveKey !== this._prevSwapedRowKey) {
      const isNeighbours = Math.abs(rowUnderActiveIndex - activeRowIndex) === 1;
      let nextOrder;

      // If they are neighbours, swap elements, else shift.
      if (isNeighbours) {
        this._prevSwapedRowKey = rowUnderActiveKey;
        nextOrder = swapArrayElements(order, activeRowIndex, rowUnderActiveIndex);
      } else {
        nextOrder = order.slice();
        nextOrder.splice(activeRowIndex, 1);
        nextOrder.splice(rowUnderActiveIndex, 0, activeRowKey);
      }

      this.setState({
        order: nextOrder,
        activeRowIndex: rowUnderActiveIndex,
      }, () => {
        if (this.props.onChangeOrder) {
          this.props.onChangeOrder(nextOrder);
        }
      });
    }
  }
 
  _findRowUnderActiveRow() {
    const {horizontal} = this.props;
    const {rowsLayouts, activeRowKey, activeRowIndex, order} = this.state;
    const movingRowLayout = rowsLayouts[activeRowKey];
    const rowLeftX = this._activeRowLocation.x
    const rowRightX = rowLeftX + movingRowLayout.width;
    const rowTopY = this._activeRowLocation.y;
    const rowBottomY = rowTopY + movingRowLayout.height;

    for (
      let currentRowIndex = 0, x = 0, y = 0, rowsCount = order.length;
      currentRowIndex < rowsCount - 1;
      currentRowIndex++
    ) {
      const currentRowKey = order[currentRowIndex];
      const currentRowLayout = rowsLayouts[currentRowKey];
      const nextRowIndex = currentRowIndex + 1;
      const nextRowLayout = rowsLayouts[order[nextRowIndex]];

      x += currentRowLayout.width;
      y += currentRowLayout.height;

      if (currentRowKey !== activeRowKey && (
        horizontal
          ? ((x - currentRowLayout.width <= rowLeftX || currentRowIndex === 0) && rowLeftX <= x - currentRowLayout.width / 3)
          : ((y - currentRowLayout.height <= rowTopY || currentRowIndex === 0) && rowTopY <= y - currentRowLayout.height / 3)
      )) {
        return {
          rowKey: order[currentRowIndex],
          rowIndex: currentRowIndex,
        };
      }

      if (horizontal
        ? (x + nextRowLayout.width / 3 <= rowRightX && (rowRightX <= x + nextRowLayout.width || nextRowIndex === rowsCount - 1))
        : (y + nextRowLayout.height / 3 <= rowBottomY && (rowBottomY <= y + nextRowLayout.height || nextRowIndex === rowsCount - 1))
      ) {
        return {
          rowKey: order[nextRowIndex],
          rowIndex: nextRowIndex,
        };
      }
    }

    return {rowKey: activeRowKey, rowIndex: activeRowIndex};
  }

  _scrollOnMove(e) {
    const {pageX, pageY} = e.nativeEvent;
    const {horizontal} = this.props;
    const {containerLayout} = this.state;
    let inAutoScrollBeginArea = false;
    let inAutoScrollEndArea = false;

    if (horizontal) {
      inAutoScrollBeginArea = pageX < containerLayout.pageX + this.props.autoscrollAreaSize;
      inAutoScrollEndArea = pageX > containerLayout.pageX + containerLayout.width - this.props.autoscrollAreaSize;
    } else {
      inAutoScrollBeginArea = pageY < containerLayout.pageY + this.props.autoscrollAreaSize;
      inAutoScrollEndArea = pageY > containerLayout.pageY + containerLayout.height - this.props.autoscrollAreaSize;
    }

    if (!inAutoScrollBeginArea &&
      !inAutoScrollEndArea &&
      this._autoScrollInterval !== null
    ) {
      this._stopAutoScroll();
    }

    // It should scroll and scrolling is processing.
    if (this._autoScrollInterval !== null) {
      return;
    }

    if (inAutoScrollBeginArea) {
      this._startAutoScroll({
        direction: -1,
        shouldScroll: () => this._contentOffset[horizontal ? 'x' : 'y'] > 0,
        getScrollStep: (stepIndex) => {
          const nextStep = this._getScrollStep(stepIndex);
          const contentOffset = this._contentOffset[horizontal ? 'x' : 'y'];

          return contentOffset - nextStep < 0 ? contentOffset : nextStep;
        },
      });
    } else if (inAutoScrollEndArea) {
      this._startAutoScroll({
        direction: 1,
        shouldScroll: () => {
          const {
            contentHeight,
            contentWidth,
            containerLayout,
            footerLayout = {height: 0},
          } = this.state;

          if (horizontal) {
            return this._contentOffset.x < contentWidth - containerLayout.width
          } else {
            return this._contentOffset.y < contentHeight + footerLayout.height - containerLayout.height;
          }
        },
        getScrollStep: (stepIndex) => {
          const nextStep = this._getScrollStep(stepIndex);
          const {
            contentHeight,
            contentWidth,
            containerLayout,
            footerLayout = {height: 0},
          } = this.state;

          if (horizontal) {
            return this._contentOffset.x + nextStep > contentWidth - containerLayout.width
              ? contentWidth - containerLayout.width - this._contentOffset.x
              : nextStep;
          } else {
            const scrollHeight = contentHeight + footerLayout.height - containerLayout.height;

            return this._contentOffset.y + nextStep > scrollHeight
              ? scrollHeight - this._contentOffset.y
              : nextStep;
          }
        },
      });
    }
  }

  _getScrollStep(stepIndex) {
    return stepIndex > 3 ? 60 : 30;
  }

  _startAutoScroll({direction, shouldScroll, getScrollStep}) {
    if (!shouldScroll()) {
      return;
    }

    const {activeRowKey} = this.state;
    const {horizontal} = this.props;
    let counter = 0;

    this._autoScrollInterval = setInterval(() => {
      if (shouldScroll()) {
        const movement = {
          [horizontal ? 'dx' : 'dy']: direction * getScrollStep(counter++),
        };

        this.scrollBy(movement);
        this._rows[activeRowKey].moveBy(movement);
      } else {
        this._stopAutoScroll();
      }
    }, AUTOSCROLL_INTERVAL);
  }

  _stopAutoScroll() {
    clearInterval(this._autoScrollInterval);
    this._autoScrollInterval = null;
  }

  _onLayoutRow(rowKey, {nativeEvent: {layout}}) {
    this._resolveRowLayout[rowKey]({rowKey, layout});
  }

  _onLayoutHeader = ({nativeEvent: {layout}}) => {
    this._resolveHeaderLayout(layout);
  };

  _onLayoutFooter = ({nativeEvent: {layout}}) => {
    this._resolveFooterLayout(layout);
  };

  _onActivateRow = (rowKey, index, e, gestureState, location) => {
    this._activeRowLocation = location;

    this.setState({
      activeRowKey: rowKey,
      activeRowIndex: index,
      releasedRowKey: null,
      scrollEnabled: false,
    });

    if (this.props.onActivateRow) {
      this.props.onActivateRow(rowKey);
    }
  };

  _onPressRow = (rowKey) => {
    if (this.props.onPressRow) {
      this.props.onPressRow(rowKey);
    }
  };

  _onReleaseRow = (rowKey) => {
    this._stopAutoScroll();
    this.setState(({activeRowKey}) => ({
      activeRowKey: null,
      activeRowIndex: null,
      releasedRowKey: activeRowKey,
      scrollEnabled: this.props.scrollEnabled,
    }));

    if (this.props.onReleaseRow) {
      this.props.onReleaseRow(rowKey, this.state.order);
    }
  };

  _onMoveRow = (e, gestureState, location) => {
    const prevMovingRowX = this._activeRowLocation.x;
    const prevMovingRowY = this._activeRowLocation.y;
    const prevMovingDirection = this._movingDirection;

    this._activeRowLocation = location;
    this._movingDirection = this.props.horizontal
      ? prevMovingRowX < this._activeRowLocation.x
      : prevMovingRowY < this._activeRowLocation.y;

    this._movingDirectionChanged = prevMovingDirection !== this._movingDirection;
    this._setOrderOnMove();

    if (this.props.scrollEnabled) {
      this._scrollOnMove(e);
    }
  };

  _onScroll = (e) => {
      this._contentOffset = e.nativeEvent.contentOffset;
      this.props.onScroll(e)
  };

  _onRefContainer = (component) => {
    this._container = component;
  };

  _onRefScrollView = (component) => {
    this._scrollView = component;
  };

  _onRefRow = (rowKey, component) => {
    this._rows[rowKey] = component;
  };
} 