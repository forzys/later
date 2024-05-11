import { useState, useEffect, memo } from "react";
import { Linking } from "react-native";
// import { Camera } from 'react-native-vision-camera'
import { auto } from "@/common/common";
import { AuthContext } from '@/hooks/context'
import Popup from '@/components/Popup'

export default memo((props)=>{
    const [config] = useState({
        button: true, 
        type: 'Warning',
        closeable:true,
        topRatio: 3,
        buttonText: 'Grant',
    });
    
    const getCameraPermission = (key, callback)=>{
        // Camera.getCameraPermissionStatus() !== 'granted' 
        // ? Popup.show({
        //     ...config,
        //     textBody: 'Need Camera permission',
        //     callback:  (e) => {
        //         ;(async ()=>{
        //             const permission = await Camera.requestCameraPermission();
        //             if (permission === 'denied') await Linking.openSettings();
        //             Popup.hide();
        //             callback()
        //         })()
        //     },
        // }): 
        callback() 
    }

    const getMicrophonePermission = (key, callback)=>{
        // Camera.getMicrophonePermissionStatus() !== 'granted'
        // ? Popup.show({
        //     ...config,
        //     textBody: 'Need Microphone permission',
        //     callback:  (e) => {
        //         ;(async ()=>{
        //             const permission = await Camera.requestMicrophonePermission();
        //             if (permission === 'denied') await Linking.openSettings();
        //             Popup.hide();
        //             callback()
        //         })()
        //     },
        // }): 
        callback();
    }

    const onCameraPermission = ()=>{ 
        return auto.withPromise(getCameraPermission, getMicrophonePermission)().then(()=>{
            console.log('授权结束')
            return Camera.getCameraPermissionStatus() === 'granted' 
        });
    }

    return (
        <AuthContext.Provider value={{ onCameraPermission }}>
            {props.children}
        </AuthContext.Provider>
    )
})