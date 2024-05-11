/**
 * https://github.com/animate-react-native/stagger
 */
import React from 'react';
import Animated, { FadeInDown, FadeOutDown, ZoomInEasyDown, LinearTransition, runOnJS } from 'react-native-reanimated';


export default function Stagger({
	children,
	enabled = true,
	stagger = 50,
	enterDirection = 1,
	exitDirection = -1,
	duration = 400,
	style,
	// entering = () => FadeInDown.duration(400),
	// exiting = () => FadeOutDown.duration(400),
	entering = () => ZoomInEasyDown.springify(),
	exiting = () => FadeOutDown.springify(),
	initialEnteringDelay = 0,
	initialExitingDelay = 0,
	onEnterFinished,
	onExitFinished,
}) {
	if (!children) {
		return null;
	}

	if (!enabled) {
		return <Animated.View style={style}>{children}</Animated.View>;
	}

	return (
		<Animated.View style={style} layout={LinearTransition}>
			{
				React.Children.map(children, (child, index) => {
					if (!React.isValidElement(child)) {
						return null;
					}
					const isLastEnter = index === (enterDirection === 1 ? React.Children.count(children) - 1 : 0);
					const isLastExit = index === (enterDirection === -1 ? React.Children.count(children) - 1 : 0);
					return (
						<Animated.View
							key={child.key || index}
							layout={LinearTransition}
							entering={entering().delay(
								initialEnteringDelay +
								(enterDirection === 1
									? index * stagger
									: (React.Children.count(children) - index) * stagger)
							).duration(duration).withCallback((finished) => {
								'worklet';
								if (finished && isLastEnter && onEnterFinished) {
									runOnJS(onEnterFinished)();
								}
							})}
							exiting={exiting().delay(
								initialExitingDelay +
								(exitDirection === 1
									? index * stagger
									: (React.Children.count(children) - index) * stagger)
							).duration(duration).withCallback((finished) => {
								'worklet';
								if (finished && isLastExit && onExitFinished) {
									runOnJS(onExitFinished)();
								}
							})}
							style={child.props.style}
						>
							{child}
						</Animated.View>
					);
			})}
		</Animated.View>
	);
}


/**
 * （列表 元素）进入 离开 时动画效果
 * 
 *  import Animated, {  FadeOutDown, ZoomInEasyDown } from 'react-native-reanimated';
 *    {
          show && (
              <Stagger
                  stagger={50}
                  duration={300}
                  exitDirection={-1}
                  entering={() => ZoomInEasyDown.springify()}
                  exiting={() => FadeOutDown.springify()}
                  style={{
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 12,
                  }}
              >
                  <Text>1. Custom duration</Text>
                  <Text>2. Custom stagger</Text>
                  <Text>3. Custom animation</Text>
                  <Text>4. Custom enter/exit direction</Text>
                  <Text>AnimateReactNative.com</Text>
                  <Text>Powered by Reanimated 3</Text>
                  <Text>Works with Expo ❤️</Text>
              </Stagger>
          )
      }
 */