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
           {/* <View style={[{ height: props?.insets? insets.top: 0, backgroundColor: theme?.transparent }, props.style]}></View> */}

           <AppBar 
                mode="center-aligned" 
                statusBarHeight={insets.top} 
                style={{ backgroundColor: props?.bg || theme?.barBg }}
                title={typeof props?.title !== 'undefined' ? props?.title : route.name}
      
                leftSize={24}
                leftIcon={props?.leftIcon}
                leftColor={props?.leftColor}
                leftCustomComponent={props?.renderLeft}
                onLeftPress={props?.onLeftPress}

                rightSize={24}
                rightIcon={props?.rightIcon}
                rightColor={props?.rightColor}
                rightCustomComponent={props?.renderRight} 
                onRightPress={props?.onRightPress}
            />

            <View style={ StyleSheet.flatten([{ flex: 1 }, props.style])}>
                {props.children}
            </View> 
        </SafeAreaView>
    )
})

export default Layout