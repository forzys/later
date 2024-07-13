import { memo, useMemo, useState } from "react";
import { Button, ScrollView, Dimensions, View, Text, Image, Pressable } from "react-native"; 
import { useAuth } from "@/hooks/index"; 
import Gallery from '@/components/Gallery'
import {FlatGrid} from '@/components/Grid'
import Layout from '@/layout/Layout'
import configs from "@/common/configs";
import {useUpdate, useReceive} from "@/hooks/index";

const { width  } = configs?.screen

const Wallpaper = memo(()=>{
    const { wallpaper, wallpaperLoading } = useAuth();
    const [state, setState] = useUpdate({
        preview: [],
        visible: false,
        initIndex: 0,
    });
 
    const [image, _width] = useMemo(()=>{ 
        const [first] = wallpaper || [{ content: [] }] 
        return [first?.content, (width - 12 * 3) / 2]
    },[wallpaper, width])
   
    const onPreview = (index)=>{ 
        const length = image.length || 0
        const min = Math.max(index - 10, 0) 
        const max = Math.min(length, min + 20)
        setState({
            preview: image.slice(min , max)?.map(i=>({ uri: i?.href?.includes('http') ? i?.href : 'https:' + i?.href })),
            initIndex: Math.min(index, 10),
        });
        setTimeout(()=>{
            setState({ visible: true })
        }) 
    }
 

    const onImagePreview = (index)=>{
        return ()=> onPreview(index)
    }
 

    // console.log({ wallpaper, imageL: image?.length })

    return (
        <Layout>  
            <FlatGrid
                itemDimension={_width}
                data={image}
                style={{ marginTop: 24, flex: 1 }}
                spacing={10}
                renderItem={({ item, index }) => { 
                    return (
                        <Pressable 
                            style={[{ 
                                justifyContent: 'flex-end',
                                borderRadius: 5, 
                                height: _width * 1.5, 
                                overflow:'hidden', 
                            }]}
                            onPress={onImagePreview(index)}
                        >
                            <Image 
                                source={{ uri: item.href?.includes('http') ? item.href :  'https:' + item.href }} 
                                style={{ backgroundColor:'#FFF', flex: 1, width:'100%' }} 
                            />
                        </Pressable>
                       
                    )
                }}  
            /> 
            
            <Gallery
                isVisible={state?.visible}
                initialIndex={state?.initIndex}
                onRequestClose={() => setState({ visible: false, })}
                images={state?.preview}
                isDownLoad={true}
            />
  
        </Layout>
    )
})


export default Wallpaper