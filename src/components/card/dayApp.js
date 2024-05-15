 
import { View, Image, StyleSheet, ImageBackground } from 'react-native';
import RNBounceable from '@/common/components/Bounceable';
import Text from '@/common/components/Text';
import Icon from '@/common/components/Icon';
// import AnimateProgress from '@/components/Progress';
import configs from '@/common/configs'

const { width, height } = configs.screen

const styles = StyleSheet.create({
  container: {
    height: height * 0.5,
    width: width * 0.9,
    borderRadius: 8,
    flexDirection: 'column',
  },
  shadowStyle: {
    flex: 1,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 3,
  },
  innerContainer: {
    left: 16,
    bottom: 16,
    position: 'absolute',
  },
  largeTitleTextStyle: {
    fontSize: 35,
    lineHeight: 33,
    color: '#fffeff',
    fontWeight: '900', 
    textAlign: 'justify',
  },
  bottomBarStyle: {
    top: 16,
    right: 16,
    height: 75,
    width: width * 0.9,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    backgroundColor: '#ef9f81',
  },
  innerBottomBarStyle: {
    margin: 16,
    flexDirection: 'row',
  },
  iconStyle: {
    width: 45,
    height: 45,
  },
  titleContainer: {
    width: 120,
    marginLeft: 12,
  },
  titleTextStyle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600', 
  },
  subtitleTextStyle: {
    marginTop: 3,
    fontSize: 12,
    color: 'white',
    fontWeight: '500', 
  },
  buttonContainer: {
    top: 8,
    right: 4,
    position: 'absolute',

  },
  buttonInnerContainer: {
    width: 75,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f1f6',
  },
  buttonTextStyle: {
    color: '#056dff',
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonSubtitleTextStyle: {
    fontSize: 9,
    marginLeft: 3,
    color: 'white',
    fontWeight: '400',
	  textAlign: 'center',
  },
});


const AppOfTheDayCard  = ({
	progress,
	style,
	title,
	subtitle,
	largeTitle,
	buttonSubtitle,
	iconStyle,
	iconSource,
	shadowStyle,
	bottomBarStyle,
	backgroundSource,
	titleTextStyle,
	subtitleTextStyle,
	largeTitleTextStyle,
	buttonSubtitleTextStyle,
	onButtonPress,
	buttonText,
	onPress,
	...rest
}) => {
	const renderLargeTitle = () => (
		<Text style={[styles.largeTitleTextStyle, largeTitleTextStyle]}>
			{largeTitle}
		</Text>
	);

	const renderIcon = () => (
		<View style={styles.iconStyle}>
			<Icon
				icon={iconSource}
				style={iconStyle}
			/>
		</View>
	);

	const renderTitleContainer = () => (
		<View style={styles.titleContainer}>
			<Text numberOfLines={2} style={[styles.titleTextStyle, titleTextStyle]}>
				{title}
			</Text>
			<Text numberOfLines={1} style={[styles.subtitleTextStyle, subtitleTextStyle]}>
				{subtitle}
			</Text>
		</View>
	);

	const renderButtonContainer = () => (
		<View style={styles.buttonContainer}>
			<RNBounceable style={styles.buttonInnerContainer} onPress={onButtonPress}>
				<Text style={styles.buttonTextStyle}>{buttonText}</Text>
			</RNBounceable>
			<Text mt style={[styles.buttonSubtitleTextStyle, buttonSubtitleTextStyle]}>
				{buttonSubtitle}
			</Text>
		</View>
	);

	const renderBottomBar = () => (
		<View style={[styles.bottomBarStyle, bottomBarStyle]}>
			<View style={styles.innerBottomBarStyle}>
			{renderIcon()}
			{renderTitleContainer()}
			{renderButtonContainer()}
			</View>
		</View>
	);

	return (
		<View style={[styles.shadowStyle, shadowStyle]}>
			<RNBounceable
				bounceEffectIn={0.95}
				{...rest}
				style={[styles.container, style]}
				onPress={onPress}
			>
				<ImageBackground
					borderRadius={8}
					resizeMode="cover"
					{...rest}
					style={[styles.container, style]}
					source={backgroundSource}
				>
					<View style={styles.innerContainer}>
						{renderLargeTitle()}
						{renderBottomBar()}
					</View>
				</ImageBackground>
			</RNBounceable>
		</View>
	);
};

export default AppOfTheDayCard;