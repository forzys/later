
import React from "react"; 
import { View, Image, SafeAreaView, TouchableOpacity, Platform, StatusBar, StyleSheet } from "react-native";
import Bounceable from "@/common/components/Bounceable";
import Icon from "@/common/components/Icon";
import Text from "@/common/components/Text";
import configs from '@/common/configs'
const { width, height } = configs.screen

export const GradientHeader = props => {
    const { 
        end={ x: 1, y: 0 },  start={ x: 0, y: 0 }, title = 'Today',  gradient = true, position, subtitle = 'Have a nice day',
        shapeColor = '#ba75df', shadowColor="#000",  shadowStyle,  imageSource,  imageOnPress,
        gradientColors = ["#12c2e9", "#c471ed", "#f64f59"], headerContentComponent 
    } = props;

  return (
		<View 
			style={[
				{ top: 0,  position: "absolute" }, 
				shadowStyle ||  styles.shadowStyle,
				shadowColor && { shadowColor },
			]}
		>
        {
            gradient ? (
                <View
                    start={start}
                    end={end}
                    colors={gradientColors}
                    style={[styles.main, styles.customShadowStyle, styles.positionStyle, position]}
                />
            ): (
                <View style={[
                    styles.main,
                    styles.positionStyle, 
                    position,
                    {backgroundColor: shapeColor || "#ba75df"},
                    styles.customShadowStyle
                  ]}
                />
            )
        }
        {headerContentComponent || ( 
            <SafeAreaView>
                <View style={styles.container}>
                    <View style={styles.leftContainer}>
                        <Text style={styles.dateTextStyle}>{title}</Text>
                        <Text style={styles.saluteTextStyle}>{subtitle}</Text>
                    </View>
                    <View style={styles.rightContainer}>
                        {imageSource && (
                            <TouchableOpacity onPress={imageOnPress}>
                            <Image source={imageSource} style={styles.myProfileImageStyle} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        )}
    </View>
  );
}

export const AppleHeader = ({ style, dateTitleTextStyle, largeTitleTextStyle, onPress, dateTitle, largeTitle, avatarStyle, imageSource, ...rest }) => {
  return (
    <View style={[styles.app_container, style]}>
      <View>
        <Text style={[styles.dateTitleTextStyle, dateTitleTextStyle]}>
          {dateTitle}
        </Text>
        <Text style={[styles.largeTitleTextStyle, largeTitleTextStyle]}>
          {largeTitle}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.avatarContainerStyle}
        {...rest}
        onPress={onPress}
      >
        <Image
          style={[styles.avatar, avatarStyle]}
          {...rest}
          source={imageSource}
        />
      </TouchableOpacity>
    </View>
  );
};

const SidedComponent = ({ style, icon, text, color = "rgba(0,0,0,0.45)", size = 18, TouchableComponent = Bounceable, customComponent, onPress }) => {
    const hitSlop = {
        top: 8,
        left: 8,
        right: 8,
        bottom: 8,
    }; 

    return customComponent ? (
      <View style={style}>
        {customComponent}
      </View>
    ) : (
        <TouchableComponent
            style={style}
            hitSlop={hitSlop}
            onPress={onPress}
        >
          <Icon icon={icon} size={size} color={color} />
          {
            text && <Text>{text}</Text>
          } 
        </TouchableComponent>
    );
};
 
export const AppBar =  ({
    style,

    leftIcon,
    leftSize,
    leftColor,
    leftText,
    leftComponentStyle,
    leftComponentDisable,
    leftCustomComponent,

    rightIcon, 
    rightSize,
    rightColor, 
    rightComponentDisable, 
    rightComponentStyle, 
    rightCustomComponent,

    onLeftPress,
    onRightPress,
    
 
    title,
    titleTextStyle,
    ...rest
}) => {
    return (
      <View style={[styles.appbar_container, style]}>
        {
            !leftComponentDisable ? (
                <SidedComponent
                  style={[styles.leftComponentStyle, leftComponentStyle]}
                  customComponent={leftCustomComponent} 
                  onPress={onLeftPress}
                  icon={leftIcon}
                  text={leftText}
                  color={leftColor}
                  size={leftSize}
                  {...rest}
                />
              ) : null
        }

        <Text numberOfLines={1} style={[{ maxWidth: (width - 24 * 2), fontSize: 20, fontWeight: "800", }, titleTextStyle]}>
            {title}
        </Text>

        {
            !rightComponentDisable ? (
                <SidedComponent
                  style={[styles.rightComponentStyle, rightComponentStyle]}
                  customComponent={rightCustomComponent}
                  onPress={onRightPress}
                  icon={rightIcon}
                  color={rightColor}
                  size={rightSize}
                  {...rest}
                />
            ) : null
        }
      </View>
    );
}

const styles = StyleSheet.create({
    main: {
        width,
        height: width,
        alignSelf: "center",
        position: "absolute",
        alignContent: "center",
        borderRadius: width / 2,
        transform: [{ scaleX: 2 }, { scaleY: 0.5 }]
    },
    customShadowStyle: {
        shadowRadius: 3,
        shadowOpacity: 0.3,
        shadowColor: "#595959",
        shadowOffset: { width: 0, height: 2 }
    },  
    shadowStyle:{
        ...Platform.select({
            ios: {
              shadowRadius: 4.65, 
              shadowOpacity: 0.29,
              shadowOffset: {
                width: 0,
                height: 3
              }
            },
            android: {
              elevation: 7
            }
        })
    },
    positionStyle:{
        ...Platform.select({
            ios: { top: height * -0.17 },
            android: { top: height * -0.185 }
        })
    },

    container: {
      width,
      flexDirection: "row",
      marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8
    },
    leftContainer: {
      left: 16
    },
    dateTextStyle: {
      fontSize: 32,
      color: "white",
      fontWeight: "bold"
    },
    saluteTextStyle: {
      fontSize: 14,
      color: "white",
      fontWeight: "500"
    },
    rightContainer: {
      right: 16,
      position: "absolute",
      flexDirection: "row"
    },
    ticketImageStyle: {
      top: 8,
      right: 20,
      width: 35,
      height: 35
    },
    myProfileImageStyle: {
      width: 50,
      height: 50,
      borderRadius: 50 / 2
    }, 

    app_container: {
      borderColor: "#EFEFF4",
      paddingBottom: 8,
      flexDirection: "row",
      marginHorizontal: 16,
      borderBottomWidth: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    dateTitleTextStyle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8E8E93",
    fontWeight: "600",
    letterSpacing: Platform.OS === "ios" ? -0.08 : undefined,
    },
    largeTitleTextStyle: {
    fontSize: 34,
    fontWeight: "bold",
    lineHeight: 41,
    color: "#000",
    letterSpacing: Platform.OS === "ios" ? 0.41 : undefined,
    },
    avatar: {
        height: 43,
        width: 43,
        borderRadius: 43 / 2,
    },
    avatarContainerStyle: {
        alignSelf: "center",
        justifyContent: "center",
    },

    appbar_container: {
        top: 0,
        height: 56,
        width: "100%",
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    leftComponentStyle: {
        left: 8,
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
    },
    rightComponentStyle: {
        right: 16,
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
    },
})

export default GradientHeader;



/**
 * <AppleHeader
    dateTitle={"Monday, 27 November"}
    largeTitle={"For You"}
    imageSource={{
      uri: profileImageSource,
    }}
    onPress={() => {}}
/>
 */
 