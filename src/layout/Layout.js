import { memo} from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useTheme } from '@/hooks/index';
import { AppBar } from '@/layout/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
// import styles from "../common/styles";

const Layout = memo((props)=>{
    const route = useRoute()
    const { theme } = useTheme() 
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()
  
    const onBack = ()=>{
        return props?.onBack ? props?.onBack?.() : navigation.goBack?.()
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme?.background  }}>
            {/* <StatusBar /> */}
           <View style={[{ height: props?.insets? insets.top: 0, backgroundColor: theme?.transparent }, props.style]}></View>

           <AppBar 
                mode="center-aligned" 
                statusBarHeight={insets.top} 
                style={{ backgroundColor: theme?.barBg }}
                title={props?.title || route.name}
                rightIcon={props?.rightIcon}
                onRightPress={props?.onRightPress}
                rightSize={24}
                rightColor={props?.rightColor}
            />

            <View style={ StyleSheet.flatten([{ flex: 1 }, props.style])}>
                {props.children}
            </View> 
        </SafeAreaView>
    )
})

export default Layout