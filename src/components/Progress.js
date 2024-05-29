import React, { forwardRef, useImperativeHandle, useState } from 'react'; 
import { Animated, Easing, View } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import Text from '@/common/components/Text'

class CircularProgress extends React.PureComponent {
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  circlePath(x, y, radius, startAngle, endAngle) {
    var start = this.polarToCartesian(x, y, radius, endAngle * 0.9999999);
    var end = this.polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    var d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y];
    return d.join(' ');
  }

  clampFill = fill => Math.min(100, Math.max(0, fill));

  render() {
    const {
      size,
      width,
      backgroundWidth,
      tintColor,
      tintTransparency,
      backgroundColor,
      style,
      rotation,
      lineCap,
      fillLineCap = lineCap,
      arcSweepAngle,
      fill,
      children,
      childrenContainerStyle,
      padding,
      renderCap,
      dashedBackground,
      dashedTint
    } = this.props;

    const maxWidthCircle = backgroundWidth ? Math.max(width, backgroundWidth) : width;
    const sizeWithPadding = size / 2 + padding / 2;
    const radius = size / 2 - maxWidthCircle / 2 - padding / 2;

    const currentFillAngle = (arcSweepAngle * this.clampFill(fill)) / 100;
    const backgroundPath = this.circlePath(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      tintTransparency ? 0 : currentFillAngle,
      arcSweepAngle
    );
    const circlePath = this.circlePath(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      0,
      currentFillAngle
    );
    const coordinate = this.polarToCartesian(
      sizeWithPadding,
      sizeWithPadding,
      radius,
      currentFillAngle
    );
    const cap = this.props.renderCap ? this.props.renderCap({ center: coordinate }) : null;

    const offset = size - maxWidthCircle * 2;

    const localChildrenContainerStyle = {
      ...{
        position: 'absolute',
        left: maxWidthCircle + padding / 2,
        top: maxWidthCircle + padding / 2,
        width: offset,
        height: offset,
        borderRadius: offset / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      ...childrenContainerStyle,
    }

    const strokeDasharrayTint = dashedTint.gap > 0 ?
      Object.values(dashedTint)
      .map(value => parseInt(value))
      : null;

    const strokeDasharrayBackground = dashedBackground.gap > 0 ?
      Object.values(dashedBackground)
      .map(value => parseInt(value))
      : null;

    return (
      <View style={style}>
        <Svg width={size + padding} height={size + padding}>
          <G rotation={rotation} originX={(size + padding) / 2} originY={(size + padding) / 2}>
            {backgroundColor && (
              <Path
                d={backgroundPath}
                stroke={backgroundColor}
                strokeWidth={backgroundWidth || width}
                strokeLinecap={lineCap}
                strokeDasharray={strokeDasharrayBackground}
                fill="transparent"
              />
            )}
            {fill > 0 && (
              <Path
                d={circlePath}
                stroke={tintColor}
                strokeWidth={width}
                strokeLinecap={fillLineCap}
                strokeDasharray={strokeDasharrayTint}
                fill="transparent"
              />
            )}
            {cap}
          </G>
        </Svg>
        {children && <View style={localChildrenContainerStyle}>{children(fill)}</View>}
      </View>
    );
  }
}

CircularProgress.defaultProps = {
  tintColor: 'black',
  tintTransparency: true,
  rotation: 90,
  lineCap: 'butt',
  arcSweepAngle: 360,
  padding: 0,
  dashedBackground: { width: 0, gap: 0 },
  dashedTint: { width: 0, gap: 0 },
};


const AnimatedProgress = Animated.createAnimatedComponent(CircularProgress);

export default class AnimatedCircularProgress extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fillAnimation: new Animated.Value(props.prefill),
    };
    if (props.onFillChange) {
      this.state.fillAnimation.addListener(({ value }) =>
        props.onFillChange(value)
      );
    }
  }

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fill !== this.props.fill) {
      this.animate();
    }
  }

  reAnimate(prefill, toVal, dur, ease) {
    this.setState(
      {
        fillAnimation: new Animated.Value(prefill),
      },
      () => this.animate(toVal, dur, ease)
    );
  }

  animate(toVal, dur, ease) {
    const toValue = toVal >= 0 ? toVal : this.props.fill;
    const duration = dur || this.props.duration;
    const easing = ease || this.props.easing;
    const useNativeDriver = this.props.useNativeDriver;
    const delay = this.props.delay;

    const anim = Animated.timing(this.state.fillAnimation, {
      useNativeDriver,
      toValue,
      easing,
      duration,
      delay,
    });
    anim.start(this.props.onAnimationComplete);

    return anim;
  }

  animateColor() {
    if (!this.props.tintColorSecondary) {
      return this.props.tintColor;
    }

    const tintAnimation = this.state.fillAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: [this.props.tintColor, this.props.tintColorSecondary],
    });

    return tintAnimation;
  }

  render() {
    const { fill, prefill, ...other } = this.props;

    return (
      <AnimatedProgress
        {...other}
        fill={this.state.fillAnimation}
        tintColor={this.animateColor()}
      />
    );
  }
}

AnimatedCircularProgress.defaultProps = {
  duration: 500,
  easing: Easing.out(Easing.ease),
  prefill: 0,
  useNativeDriver: false,
  delay: 0,
};


export const Received = forwardRef((props, ref)=>{
  const [progress, setProgress] = useState(props.init || '')

  useImperativeHandle(ref, ()=>({
    setProgress: (value)=> setProgress(value)
  }))

  return (
    <Text style={props.style}>{progress}</Text> 
  )
})