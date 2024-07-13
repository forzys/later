import { memo, useRef, useCallback } from "react"
import Layout from "@/layout/Layout"
import { ScrollView, View } from 'react-native';
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'
import Bounceable from '@/common/components/Bounceable'
import {useUpdate, useReceive} from "@/hooks/index";
import Input from "@/components/Input";
import Card, {ButtonCard, WarpCard} from "@/components/Card";
import QRCode from "@/components/QRCode";
import configs from '@/common/configs'
import fetcher from '@/common/fetcher'
import RNFetchBlob from 'react-native-blob-util'
import {Received} from "@/components/Progress";

const QR = memo(({ navigation })=>{
    const svgRef = useRef();
    const progressRef = useRef(null);
    const [state, setState] = useUpdate({
        value: ''
    });
 

    const onCreate = ()=>{
        // console.log({ value: state?.value })
        setState({ qrvalue: state?.value })
    }

 
    const download = useCallback(() => {
      svgRef.current?.toDataURL(async (data) => {
        const path = `${configs.dirs.CacheDir}/aliyun.png`;
        await RNFetchBlob.fs.writeFile(path, data, 'base64');
 
        fetcher.MediaCollection.copyToMediaStore({
                name: 'aliyun.png', // name of the file
                parentFolder: '', // subdirectory in the Media Store, e.g. HawkIntech/Files to create a folder HawkIntech with a subfolder Files and save the image within this folder
                mimeType: 'image/png' // MIME type of the file
            },
            'Image', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
            path // Path to the file being copied in the apps own storage
        ).then((result)=>{ 
            console.log({result  })
        }).catch(e=>{
            console.log({e  })
        })



      })
    }, [svgRef.current])

    return (
        <Layout back> 
            <ScrollView style={{ flex: 1  }} contentContainerStyle={{ padding: 12,gap: 12  }}>
 
                <View style={{ height: 24  }}> 
                    <Bounceable onPress={()=>navigation?.navigate('Modal', { name: 'Qrcode', title:'WIFI 二维码' })}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap:3, position:'absolute', padding:6, right: 0, width: 120, justifyContent:'flex-end' }}>
                            <Icon disabled icon="info-circle" size={12} color="#afafaf" />
                            <Text t4 style={{marginTop: -2}} color="#afafaf">生成 WIFI二维码</Text>
                        </View>
                    </Bounceable>
                </View>

                <View style={{  gap: 12, height: 24 * 4 }}>
                    <Input
                        placeholder="请输入内容"
                        textInputStyle={{ flex: 1, height: 24 * 4, textAlignVertical: 'top'  }}
                        style={{ flex: 1, paddingBottom: 12,  }}
                        maxLength={200}
                        value={state.value}
                        onChangeText={(txt)=>{
                            setState({ value: txt });
                            progressRef.current.setProgress(`${txt.replace(/\n/g,'').length}/200`)
                        }}
                        clearTextOnFocus
                        multiline
                        iconStyle={{ position:'absolute', bottom: 2, right: 3 }}
                        enableIcon={(<Received ref={progressRef} init={'0/200'} style={{ fontSize:12, padding: 2, backgroundColor: 'rgba(236, 238, 245, 0.5)'  }} />)}
                    />
                </View>
                <View style={{flexDirection:'row', gap: 12, alignItems:'center', justifyContent:'flex-end'}}>
                    <Text t4 style={{ textDecorationLine: 'underline', padding: 6 }} onPress={()=>setState({ value: '', qrvalue: '' })}>清除</Text>
                    <ButtonCard style={{ alignSelf: 'flex-end', padding: 6 }} textProps={{t3: true }} disabled={!state?.value?.length}  onPress={onCreate}>生成</ButtonCard> 
                </View>

                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                    {
                          (
                            <View style={{ padding: 12, backgroundColor:'#FFF', borderRadius: 6}}>  
                                <QRCode
                                    ref={svgRef}
                                    value={"https://www.alipan.com/s/DkH7jWvcX7i"}
                                    size={120}
                                    logoSize={30}
                                    dotScale={0.8}
                                    dotRadius="50%"
                                    positionRadius={["5%", "1%"]}
                                    errorCorrection="H"
                                    logo={'https://img.alicdn.com/imgextra/i2/O1CN011vHpiQ251TseXpbH7_!!6000000007466-2-tps-120-120.png'}
                                /> 
                                <ButtonCard onPress={download}>download</ButtonCard>
                            </View> 
                        )
                    }
                </View>
            </ScrollView> 
        </Layout>
    )
})

export default QR