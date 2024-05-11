import React, { Component } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import configs from '@/common/configs';

const { width, height } = configs.screen;

class Confetti extends Component {
  constructor(props) {
      super(props);
      this._yAnimation = new Animated.Value(0);
      this.color = this.randomColor(this.props.colors);
      this.left = this.randomValue(0, width);
      let rotationOutput = this.randomValue(-220, 220) + 'deg';
      this._rotateAnimation = this._yAnimation.interpolate({
        inputRange: [0, height / 2, height],
        outputRange: ['0deg', rotationOutput, rotationOutput]
      });

      let xDistance = this.randomIntValue((width / 3 * -1), width / 3);
      this._xAnimation = this._yAnimation.interpolate({
        inputRange: [0, height],
        outputRange: [0, xDistance]
      });
  }

  componentDidMount() {
      let {duration, index} = this.props;
        Animated.timing(this._yAnimation, {
           duration: duration + this.randomIntValue(duration * .2, duration * -.2),
           toValue: height + 1.25,
           useNativeDriver: true
        }).start(this.props.onAnimationComplete);
  }

  getTransformStyle() {
      return {
         transform: [
           {translateY: this._yAnimation},
           {translateX: this._xAnimation},
           {rotate: this._rotateAnimation}
         ]
      }
  }

  getConfettiStyle() {
      let {index, size, bsize} = this.props;
      let bigConfetti = {
        height: 5.5*size,
        width: 11*size,
        borderBottomLeftRadius: 5*bsize,
        borderBottomRightRadius: 5*bsize,
        borderTopLeftRadius: 2.6*bsize,
        borderTopRightRadius: 2.6*bsize
      };
      let smallConfetti = {
        height: 4.5*size,
        width: 8*size,
        borderBottomLeftRadius: 2.5*bsize,
        borderBottomRightRadius: 2.5*bsize,
        borderTopLeftRadius: 1.3*bsize,
        borderTopRightRadius: 1.3*bsize
      }
      return index % 5 === 0 ? smallConfetti : bigConfetti;
  }

  randomValue(min, max) {
      return Math.random() * (max - min) + min;
  }

  randomIntValue(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
  }

  randomColor(colors) {
      return colors[this.randomIntValue(0,colors.length)];
  }

  render() {
    let { left, ...otherProps } = this.props;
    return <Animated.View style={[styles.confetti, this.getConfettiStyle(), this.getTransformStyle(), { marginLeft: this.left, backgroundColor: this.color }]} {...otherProps} />
  }
}

Confetti.defaultProps = {
    duration: 4000,
    colors: [
      "rgb(242.2, 102, 68.8)",
      "rgb(255, 198.9, 91.8)",
      "rgb(122.4, 198.9, 163.2)",
      "rgb(76.5, 193.8, 216.7)",
      "rgb(147.9, 99.4, 140.2)"
    ],
    size: 1,
    bsize: 1
}

class ConfettiView extends Component {
 
	static confettiInstance

	static show(option) { 
		this.confettiInstance.startConfetti(option)
	}

  constructor(props) {
      super(props);
      this.state = {confettis: []};
      this.confettiIndex = 0;
      this.shouldStop = false;
  }

  componentDidMount() {
    if (this.props.startOnLoad) {
      this.startConfetti();
    }
  }

  componentWillUnmount() {
    this.stopConfetti();
  }

  startConfetti(onComplete) {
       let {confettis} = this.state;
       let {confettiCount, timeout, untilStopped} = this.props;
       this.shouldStop = false;
       if(untilStopped || this.confettiIndex < confettiCount) {
         setTimeout(() => {
           if (this.shouldStop) {
             return;
           } else {
             confettis.push({key: this.confettiIndex});
             this.confettiIndex++;
             onComplete && this.setState({ onComplete });
             this.setState({confettis});
             this.startConfetti();
           }
         }, timeout);
       }
  }

  removeConfetti(key) {
       let {confettis, onComplete} = this.state;
       let {confettiCount} = this.props;
       let index = confettis.findIndex(confetti => {return confetti.key === key});
       confettis.splice(index, 1);
       this.setState({confettis});
       if(key === confettiCount - 1) {
         this.confettiIndex = 0;
       }
       if(confettis.length === 0 && onComplete && typeof onComplete === 'function') {
         onComplete();        
       }
  }

  stopConfetti() {
    this.shouldStop = true;
    this.confettiIndex = 0;
    const { onComplete } = this.state;
    if(onComplete && typeof onComplete === 'function') {
      onComplete();        
    }
    this.setState({ confettis: [], onComplete: null });
  }

  render() {
       let {confettis} = this.state;
       let {...otherProps} = this.props
       return <View style={styles.container}>
         {confettis.map(confetti => {
             return <Confetti key={confetti.key} index={confetti.key} onAnimationComplete={this.removeConfetti.bind(this, confetti.key)} colors={this.props.colors} {...otherProps}/>
         })}
       </View>
  }
}

ConfettiView.defaultProps = {
   confettiCount: 50,
   timeout: 10,
   duration: 4000,
   untilStopped: false
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  confetti: {
    position: 'absolute',
    marginTop: 0
  }
});

export default ConfettiView;


/***
 * 五彩纸屑雨
 * import Confetti from 'react-native-confetti';
 *  <Confetti ref={(node) => this._confettiView = node}/>
 *  this._confettiView.startConfetti();
 * 
 * https://github.com/cdvntr/react-native-confetti
 */