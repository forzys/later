import { NativeModules } from 'react-native';

export default {
    getIp: function getIp(){
        const IPModule = NativeModules.IPModule;
        return new Promise((resolve, reject)=>{ 
            IPModule.getIPAddress().then((result) => {
                resolve(result.ipAddress)
            }).catch((error) => {
                reject(error)
                console.error('Failed to get device IP address:', error);
            });
        }) 
    },

    getWifi:function getWifi(){
        const IPModule = NativeModules.IPModule;
        return new Promise((resolve, reject)=>{ 
            IPModule.getWifiName().then((result) => {
                console.log({ result  })
                resolve(result)
            }).catch((error) => {
                reject(error)
                console.error('Failed to get device Wifi name:', error);
            });
        }) 
    }
}

