import { NativeModules } from 'react-native';

export default function getIp(){
    const IPModule = NativeModules.IPModule;
    return new Promise((resolve, reject)=>{ 
        IPModule.getIPAddress().then((result) => {
            resolve(result.ipAddress)
        }).catch((error) => {
            reject(error)
            console.error('Failed to get device IP address:', error);
        });
    }) 
}