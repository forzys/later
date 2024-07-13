import RNFetchBlob from 'react-native-blob-util'
import { auto } from '@/common/common'
import configs from '@/common/configs'

const withAuthorization = async (request, resource, options = {}) => {
    try{
        const { origin = '', ...other } = options
        const token = configs.token;
        return request(origin + resource, {
            ...other,
            headers:{
                Authorization: `Bearer ${token}`,
                ...other?.headers
            },
        })
    }catch(e){ throw e }
}

const fetcher = {
    notion: {
        get: async (resource)=>{
            const res = await withAuthorization(fetch, resource, {
                origin: 'https://api.notion.com/v1/databases/',
                headers: {
                    'Notion-Version': '2022-06-28'
                }
            })
            return res.json()
        },
        post:async(resource, data)=>{
            const res = await withAuthorization(fetch, resource, {
                origin: 'https://api.notion.com/v1/databases/',
                method:'POST',
                headers: {
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: typeof data === 'object' ? JSON.stringify(data) : undefined,
            })
            return res.json()
        },

    },  

    download:(url, config = {})=>{
        return new Promise((resolve, reject)=>{
            console.log("开始下载: ", url);
            RNFetchBlob.config({
                wifiOnly: configs?.wifiOnly,
                session: config?.session || 'cache',
                fileCache: true,
                // addAndroidDownloads: {
                //     useDownloadManager: true,
                //     notification: true, 
                //     title: 'Great ! Download Success ! :O ', 
                //     description: '正在下载ing', 
                //     mediaScannable: true,
                //     mime: 'application/pdf',
                // }
            }).fetch('GET', url).then((res) => { 
                res.session(config?.session || 'cache');
                const path = res.path()
                resolve({ path: path });
            }).catch(e=>{ 
                console.log("The file saved to error", e);
                reject(e)
            });
        }) 
    },
    fetch:(url, config)=>{
        return new Promise((resolve, reject)=>{
            RNFetchBlob.config({
                wifiOnly: configs?.wifiOnly 
            }).fetch('GET', url).progress((received, total) => {
                console.log('progress', received / total)
            }).then((res) => { 
                // res.session(config?.session || 'cache');
                const path = res.path()
                console.log({ res });
                resolve({ path: path });
            }).catch(e=>{ 
                console.log("The file saved to error", e);
                reject(e)
            })
        }) 
    }, 
    get: (url, config = {}, progress)=>{
        return new Promise((resolve, reject)=>{
            RNFetchBlob.config({
                ...config,
                wifiOnly: configs?.wifiOnly,
                session: config?.session || 'cache',
                fileCache: true,
                appendExt:config?.appendExt,
                path: config.path ? RNFetchBlob.fs.dirs.DownloadDir+ "/" + config.path : undefined, 
            }).fetch('GET', url).progress((received, total) => { 
                typeof progress === 'function' ? progress(received, total) : console.log('progress', received / total);
            }).then((res) => { 
                res.session(config?.session || 'cache');
                const path = res.path()
                resolve({ path: path });
            }).catch(e=>{ 
                console.log("The file saved to error", e);
                reject(e)
            })
        }) 
    },
   
    html:(url)=>{
        return new Promise((resolve, reject)=>{
            RNFetchBlob.config({
                session: 'html',
                fileCache: true,
                path: RNFetchBlob.fs.dirs.DownloadDir+ "/" + auto.uuid() + '.html',

            }).fetch('GET', url).then((res) => {
                console.log("The file saved to ", res.path());
 
                resolve(res.path());

            }).catch(e=>{ 
                console.log("The file saved to error", e);
                reject(e)
            })
        })
    },

    font:(url, { name })=>{
        return new Promise((resolve, reject)=>{
            RNFetchBlob.config({
                session: 'font',
                fileCache: true,
                path: RNFetchBlob.fs.dirs.DocumentDir+ "/" + name,
            }).fetch('GET', url).then((res) => {
                console.log("The file saved to ", res.path());
                resolve(res.path());
            }).catch(e=>{ 
                console.log("The file saved to error", e);
                reject(e)
            })
        })
    },

    exists:(path)=>{
        return new Promise((resolve, reject)=>{
            RNFetchBlob.fs.exists(path).then((exist) => {
                resolve(exist);
                // console.log(`file ${exist ? '' : 'not'} exists`)
            }).catch((e) => { 
                reject(e)
            })
        })
    },
    android: RNFetchBlob.android,
    remove:(name, path)=>RNFetchBlob.session(name).remove(path),
    removeHTML: () => RNFetchBlob.session('html').dispose(),
    list: ( name = 'html') => RNFetchBlob.session(name).list(),
    session: ( name = 'cache') => RNFetchBlob.session(name).list(),
    file: (path) => RNFetchBlob.fs.readFile(path, 'utf8'),
 
    MediaCollection: RNFetchBlob.MediaCollection,
 }

 export default fetcher