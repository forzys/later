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
    const [visible, setVisible] = useState(false);

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


    useEffect(()=>{
        if(storage && !current.loading){
            current.loading = true
            const localTimeLine = auto.jsonFormat(storage?.getString('timeline'), [])
            onGetTimeLine(localTimeLine)
        }
    },[storage]) 

    return (
        <AuthContext.Provider 
            value={{
                timeLine,
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
                            <Text>{current?.updated?.info}</Text>
                            {
                                !!current?.updated?.apk && (
                                    <View style={{ flexDirection:'row', gap: 24,alignItems:'center', alignSelf:'flex-end', }}>
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
