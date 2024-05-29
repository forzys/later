import { memo, useMemo} from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useTheme } from '@/hooks/index';
import { AppBar } from '@/layout/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Freeze from "@/common/freeze";

const Layout = memo(({ freeze = true , ...props})=>{
    const route = useRoute()
    const { theme } = useTheme() 
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()
    const isFocused = useIsFocused();
 
    const backConfig = useMemo(()=>{
        return props.back ? {
            leftIcon: 'chevron-left',
            onLeftPress: navigation.goBack, 
            leftText: '返回',
            leftSize: 20,
        } : {
            leftIcon: props.leftIcon,
            leftColor: props.leftColor,
            leftCustomComponent:props.renderLeft,
            onLeftPress: props?.onLeftPress, 
        }
    },[props.back, props?.onLeftPress, props.renderLeft, props.leftColor, props.leftIcon])
     

    return (
        <Freeze freeze={!isFocused && freeze}> 
            <SafeAreaView style={{ flex: 1, backgroundColor: theme?.background  }}>
                {/* <StatusBar /> */}
            {/* <View style={[{ height: props?.insets? insets.top: 0, backgroundColor: theme?.transparent }, props.style]}></View> */}

                <AppBar 
                    mode="center-aligned" 
                    // statusBarHeight={insets.top} 
                    style={{ backgroundColor: "#FFF" || props?.bg || theme?.barBg }}
                    title={typeof props?.title !== 'undefined' ? props?.title : route.name}
                    titleTextStyle={props?.titleTextStyle}
 
                    {...backConfig}
                    // leftIcon={props?.leftIcon}
                    // leftColor={props?.leftColor}
                    // leftCustomComponent={props?.renderLeft}
                    // onLeftPress={props?.onLeftPress}

                    rightSize={24}
                    rightIcon={props?.rightIcon}
                    rightColor={props?.rightColor}
                    rightCustomComponent={props?.renderRight} 
                    onRightPress={props?.onRightPress}
                />

                <View style={StyleSheet.flatten([{ flex: 1 }, props.style])}>
                    {props.children}
                </View> 
            </SafeAreaView>
        </Freeze>
    )
})

export default Layout