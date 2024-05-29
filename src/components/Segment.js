import   {useCallback, useState, useEffect } from "react";
import { Text, Animated,  Dimensions, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
 
const { width: ScreenWidth } = Dimensions.get("screen");

const _containerStyle = (width) => ({
    width: width || ScreenWidth - 32,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F3F5F6",
  });

export const _selectedTabStyle = (tabs, activeTabColor, translateXAnimation, width ) => [
    {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 8,
      marginVertical: 2,
      marginHorizontal: 2,
      width: (width ? width - 8 : ScreenWidth - 35) / tabs?.length,
      backgroundColor: activeTabColor,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 3,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 4,
      transform: [
        {
          translateX: translateXAnimation,
        },
      ],
    },
  ];


const styles = StyleSheet.create({
    tab: {
      flex: 1,
      paddingVertical: 8, // iOS Default
      alignItems: "center",
      justifyContent: "center",
    },
    textStyle: {
      fontSize: 14, // iOS Default
      lineHeight: 18,
      textAlign: "center",
      fontWeight: "500",
    },
}); 

 
const SegmentedControl = ({
  style,
  tabs,
  width,
  onChange,
  tabStyle,
  textStyle,
  selectedTabStyle,
  initialIndex = 0,
  activeTextColor = "#3b3b3b",
  activeTabColor = "#fff",
  extraSpacing = 0,
}) => {
  const translateValue =
    (width ? width + extraSpacing : ScreenWidth - 35) / tabs.length;
  const [slideAnimation, _] = useState(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleTabPress = useCallback((index) => {
    setCurrentIndex(index);
    onChange && onChange(index);
  }, []);

  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: (I18nManager.isRTL ? -1 : 1) * currentIndex * translateValue,
      stiffness: 180,
      damping: 25,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const renderSelectedTab = () => (
    <Animated.View
      style={[
        _selectedTabStyle(tabs, activeTabColor, slideAnimation, width),
        selectedTabStyle,
      ]}
    />
  );

  const renderTab = (tab, index) => {
    const isActiveTab = currentIndex === index;
    const isTabText = typeof tab === "string";
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.5}
        style={[styles.tab, tabStyle]}
        onPress={() => handleTabPress(index)}
      >
        {!isTabText ? (
          tab
        ) : (
          <Text
            numberOfLines={1}
            style={[
              styles.textStyle,
              textStyle,
              isActiveTab && { color: activeTextColor },
            ]}
          >
            {tab}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[_containerStyle(width), style]}>
      {renderSelectedTab()}
      {tabs.map((tab, index) => renderTab(tab, index))}
    </Animated.View>
  );
};

export default SegmentedControl;