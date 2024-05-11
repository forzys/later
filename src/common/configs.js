


import { Dimensions, StatusBar, Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util'

const { height, width } = Dimensions.get('window');

const getStatusBarHeight = () => {
    let statusBarHeight = 20; 
    if (Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV) {
        if (width === 375 && height === 812) {
            statusBarHeight = 44;
        } else if (width === 414 && height === 896) {
            statusBarHeight = 44;
        } else if (width === 390 && height === 844) {
            statusBarHeight = 47;
        } else if (width === 428 && height === 926) {
            statusBarHeight = 47;
        } else if (width === 393 && height === 852) {
            statusBarHeight = 54;
        } else if (width === 430 && height === 932) {
            statusBarHeight = 54;
        }
    }
    return Platform.select({
        ios: statusBarHeight,
        android: StatusBar.currentHeight,
        default: 0,
    });
}





export default class configs { 

    static token = 'secret_gjNyaXjh7wLZcFG7BLKFIJTtgtAKlB9r0mkU5rK348o';

    static devices = {
        isIOS: Platform.OS === "ios",
        isAndroid:  Platform.OS === "android",
    }

    static screen = { width, height }

    static getStatusBarHeight = getStatusBarHeight

    static navigate;

    // 全局服务
    static server;

    // DocumentDir
    // CacheDir
    // MainBundleDir (Can be used to access files embedded on iOS apps only)
    // DCIMDir (Android Only)
    // DownloadDir (Android Only)
    // MusicDir (Android Only)
    // PictureDir (Android Only)
    // MovieDir (Android Only)
    // RingtoneDir (Android Only)
    // SDCardDir (0.9.5+ Android Only)
    static dirs =  RNFetchBlob.fs.dirs

    static session =  RNFetchBlob.session
    
    static android =  RNFetchBlob.android

    static wifiOnly = false
 
}

 