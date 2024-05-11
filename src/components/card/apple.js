import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import RNBounceable from '@/common/components/Bounceable';
import configs from '@/common/configs'

const { width, height } = configs.screen

const styles = StyleSheet.create({
  shadowStyle: {
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 3,
  },
  backgroundStyle: {
    borderRadius: 8,
    width: width * 0.9,
    height: height * 0.5,
  },
  topHeaderContainer: {
    margin: 16,
    width: width * 0.7,
  },
  smallTitleTextStyle: {
    fontSize: 16,
    opacity: 0.8,
    color: '#ebe8f9',
    fontWeight: '700',
  },
  largeTitleTextStyle: {
    fontSize: 32,
    opacity: 0.9,
    color: '#fffdfe',
    fontWeight: 'bold',
  },
  bottomContainer: {
    left: 16,
    bottom: 16,
    width: '90%',
    position: 'absolute',
  },
  footnoteTextStyle: {
    fontSize: 12,
    color: '#fffdfe',
  },
});

const AppleCard  = ({
    source,
    style,
    footnote,
    footnoteTextStyle,
    backgroundStyle,
    smallTitle,
    largeTitle,
    shadowStyle,
    smallTitleTextStyle,
    largeTitleTextStyle,
    onPress,
    children,
    ...rest
}) => {

    const Content = ()=>{
      return (
        <ImageBackground
            {...rest}
            source={source}
            borderRadius={8}
            resizeMode="cover"
            style={[styles.backgroundStyle, backgroundStyle]}
        > 
              <View style={styles.topHeaderContainer}>
                  <Text style={[styles.smallTitleTextStyle, smallTitleTextStyle]}>
                      {smallTitle}
                  </Text>
                  <Text style={[styles.largeTitleTextStyle, largeTitleTextStyle]}>
                      {largeTitle}
                  </Text>
              </View>
              <View style={styles.bottomContainer}>
                  <Text style={[styles.footnoteTextStyle, footnoteTextStyle]}>
                      {footnote}
                  </Text>
              </View>
          </ImageBackground> 
      )
    }

    return (
        <View style={[styles.shadowStyle, shadowStyle]}>
            <RNBounceable
                bounceEffectIn={0.95}
                {...rest}
                style={style}
                onPress={onPress}
            >
              {
                children ? children : Content()
              }
            </RNBounceable>
        </View>
    );
};

export default AppleCard;