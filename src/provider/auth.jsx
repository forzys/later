import { useState, useEffect, memo, useRef } from "react";
import { View } from "react-native";
import Text from "@/common/components/Text";
import Icon from "@/common/components/Icon";
import {Received} from "@/components/Progress";
import { auto } from "@/common/common";
import fetcher from "@/common/fetcher";
import { AuthContext } from '@/hooks/context'
import { useStorage } from '@/hooks/index'
import Modal from "@/components/Modal";
import {WarpCard, ButtonCard} from "@/components/Card";
import configs from "@/common/configs";

const { height } = configs.screen

export default memo((props)=>{
    const progressRef = useRef(null)
    const { current } = useRef({})
    const [storage] = useStorage('later.config')
    const [timeLine, setTimeLine] = useState([]);
    const [sleeps, setSleeps] = useState([]);
    const [wallpaper, setWallpaper] = useState([]);
    const [faces, setFaces] = useState([]);


    const [visible, setVisible] = useState(false);
 
    const onGetSleeps = ()=>{ 
        const colors = [ 
            '#748b85',
            '#5b716c',
            '#475a55',

            '#32cd9f',
            '#15b48a',
            '#099270',

            '#3297ae',
            '#2b778f',
        ]
        fetcher.notion.post('5f4776a24dd54afdb4b6d5c3dde1ef47/query').then(res=>{
            const properties = res.results?.map((obj)=>{
                const { Name, CName, Tags, File }= obj?.properties; 
 
                return {
                    name: Name?.title[0]?.plain_text, 
                    cname:CName?.rich_text[0]?.plain_text, 
                    tag: Tags?.multi_select[0]?.name,
                    uri: File?.files[0]?.file?.url,
                }
            }); 

            const objTags = properties.reduce((summ, item)=>{
                const aTag = summ[item.tag] || [] 
                aTag.push( item ) 
                summ[item.tag] = aTag 
                return summ
            },{})

            const sleeps = Object.keys(objTags)?.map((key, index)=>{
                return {
                    title: key,
                    color: colors[index],
                    data:  objTags[key]
                }
            })
 
            setSleeps(sleeps);
        })
    }
 
    const onGetWallpaper = ()=>{
        return new Promise((resolve, reject)=>{ 
            fetcher.notion.post('30af5c7d148e44da84e1b51a500ce90b/query').then(res=>{
                const wallPaper = res.results?.map((obj)=>{
                    const { Name, Tags, Files, Content }= obj?.properties; 
 
                    return {
                        name: Name?.title[0]?.plain_text, 
                        tag: Tags?.multi_select[0]?.name,
                        // uri: Files?.files[0]?.file?.url,
                        content: auto.jsonFormat(Content?.rich_text[0]?.plain_text, []), 
                    } 
                })
                
                setWallpaper(wallPaper) 
            }) 
        }) 
    }

    const onGetFace = ()=>{

        fetcher.notion.post('8e3d63d6941847e791ea39d9554eeff0/query', { filter: {property: 'Tag', select: { equals: "face" }} }).then(res=>{
            const faces = res.results?.map((obj)=>{
                const { Name, Tags, Files, Content }= obj?.properties; 
                const content = auto.jsonFormat(Content?.rich_text[0]?.plain_text, [])  
                return {
                    name: Name?.title[0]?.plain_text, 
                    content: content
                }
            })
            
            setFaces(faces) 
        })
    }
 
  
    const onGetTimeLine = (local)=> {
        const version = storage?.getNumber('version') || 0
        current.version = version;
  
        fetcher.notion.post('956ca90f68dd46a8996070e67ef76521/query').then(res=>{
            const timeline = res.results?.map((obj)=>{
                const { Name, Tags, Info, Apk, Allow, Version }= obj?.properties;
 
                const result = {
                    version: Version.number,
                    name: Name?.title[0]?.plain_text,
                    info:Info?.rich_text[0]?.plain_text, 
                    apk: Apk?.url, 
                    allow: Allow.checkbox,
                    tag: Tags?.multi_select?.name,  
                }

                if(result.version > current.version){
                    current.version = result.version; 
                    current.updated = result
                } 
                return result 
            }); 
 
            if(version < current.version){
                storage?.set('version', current.version)
                storage?.set('timeline', JSON.stringify(timeline))
                setTimeLine(timeline);
                setVisible(true);
                return 
            }
            setTimeLine(local);
        })
    } 

    const onDownLoad = () => { 
        const { apk, version } = current.updated
        if(current.isDownLoad){
            return
        }
        current.isDownLoad = true
        // fetcher.remove('cache', `com.later.version-${version}.apk`);
        fetcher.get(apk, { 
            path: `com.later.version-${version}.apk`,
            addAndroidDownloads: {
                useDownloadManager: true, 
                notification: true, 
                title: `later.apk`,
                mime: 'application/vnd.android.package-archive',
                description: 'download apk with a new version: ' + version,
                mediaScannable: true,
                notification: true,
            }
        }, (received, total)=>{
            progressRef?.current?.setProgress(Math.floor((received / total) * 100 * 10) / 10 + '%');  
        }).then((ext)=>{
            current.isDownLoad = false;
            setVisible(false)
            fetcher.android.actionViewIntent(ext.path, 'application/vnd.android.package-archive');

 
        }).catch(e=>{
            console.log({ e })
        })
    }
 
    // const getRemoteRun = (key, path)=>{
    // }
    // const getLocalRun = (info)=>{
    // } 
    // const getConfig = ()=>{

    //     fetcher.notion.post('956ca90f68dd46a8996070e67ef76521/query').then(res=>{
  
    //         for(let item of res.results){
    //             const { Name, Time, Version, Path }= item?.properties;
                
    //             const name =  Name?.title[0]?.plain_text
    //             const path =  Path?.rich_text[0]?.plain_text
    //             const time = Time.date.start 
    //             const key = name + 'LastUpdate'
    //             const local = storage.getString(key)

 
    //             console.log({ key, time })
    //             if(local !== time){
    //                 // storage.set(key, time)
    //                 getRemoteRun(key, path)

    //             }else{
    //                 getLocalRun(key); 

    //             }
    //             // const result = {
    //             //     time: Time.date.start,
    //             //     name: Name?.title[0]?.plain_text,
    //             //     Version: Version.number,
    //             //     path: Path?.rich_text[0]?.plain_text, 
    //             // }
    //         }
 
    //         // getRemoteRun(setting)

    //     }) 

    // }

    useEffect(()=>{
        if(storage && !current.loading){
            current.loading = true
            const localTimeLine = auto.jsonFormat(storage?.getString('timeline'), [])
            
            onGetTimeLine(localTimeLine) 
            onGetSleeps()

            onGetWallpaper()
            onGetFace()
        } 
    },[storage])




    // console.log({  wallpaper })
   

    return (
        <AuthContext.Provider 
            value={{
                timeLine,
                sleeps,
                wallpaper,
                faces,
                version: current.version,
            }}
        >
            {props.children}
 
            <Modal
                visible={visible}
                dialogStyle={{ height: height * 0.6, backgroundColor:'transparent'  }}
            > 
                <View style={{ position:'absolute', top: 0, left: '48%', zIndex: 1, }}>
                    <Icon icon="system-update" size={48}  style={{ color:'#DBB5B5' }} />
                </View>
                {
                    current?.updated?.allow && (
                        <View style={{ position:'absolute', top: 16, right: 20, zIndex: 1,  }}>
                            <Icon icon="circle-close" size={28}  style={{ color:'#DBB5B5' }} onPress={()=> setVisible(false)} />
                        </View>
                    ) 
                } 
                {
                    current?.updated && (
                        <WarpCard style={{ flexDirection:'column', width: '100%', paddingTop: 48, paddingBottom: 12 }}> 
                            <Text h4>发现新版本 <Text t2>{current?.updated?.name}</Text></Text> 
                            <Text style={{ width:'100%', paddingHorizontal: 24 }}>{current?.updated?.info}</Text>
                            {
                                !!current?.updated?.apk && (
                                    <View style={{  flexDirection:'row', gap: 24,alignItems:'center', alignSelf:'flex-end', }}>
                                        <Received ref={progressRef} />
                                        <ButtonCard onPress={onDownLoad} textProps={{ style: { fontSize: 12 } }} style={{  padding: 6, backgroundColor: '#DBB5B5' }}>
                                            下载
                                        </ButtonCard>
                                    </View> 
                                )
                            }
                        </WarpCard>
                    )
                } 
            </Modal> 
        </AuthContext.Provider>
    )
})
