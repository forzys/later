import { memo, useMemo } from "react";
import { View, ScrollView, Image } from "react-native";
import Text from '@/common/components/Text' 
import Checkbox from '@/components/Checkbox' 
import Card, { ButtonCard } from "@/components/Card"; 
import Layout from "@/layout/Layout"; 
import {useUpdate, useReceive} from "@/hooks/index";
import { assets } from "@/common/common";

const RouteDouyin = memo(({ title, navigation })=>{
    const { onGetHistory, onSetHistory, historyKey } = useReceive()
    const [state, setState, { cache }] = useUpdate({
        isEdit: false,
        selected: {},
    });

    const options = useMemo(()=>{
        return onGetHistory('douyin')
    },[historyKey])

    const count = useMemo(()=>{
        return Object.keys(state.selected)?.length
    },[state.selected])

    const onSelectAll = (isChecked)=>{
        const keys = {} 
        if(isChecked){
            for(let item of options){
                keys[item?.key] = true
            }
        }
        setState({ selected: keys }) 
    }

    const onSelectItem = (key)=>{
        return (isChecked)=>{
            const selected = {...state?.selected } 
            isChecked ? (selected[key] = true) : (delete selected[key]);
            cache.selected = selected 
            setState({ selected })
        }
    } 

    const onRemoveHistory = ()=>{
        // const selected = {...cache?.selected }
        // const history = options?.filter(item=>!selected[item.key]) 
        // onSetHistory('douyin', history)
        // setState({ isEdit: false });
    }

    const onRemoveItems = ()=>{
        const selected = {...state?.selected }
        const history = options?.filter(item=>!selected[item.key]) 
        onSetHistory('douyin', history)
        setState({ selected: {} })
    }
    
    return (
        <Layout 
            title={title} 
            rightIcon="close" 
            renderLeft={(<Text>{state?.isEdit ? '取消' : '编辑'}</Text>)} 
            onLeftPress={()=>setState({ isEdit: !state?.isEdit })}
            onRightPress={()=>navigation?.goBack()}
        >
            <View style={{ flex: 1 }}>
                {
                    state.isEdit && (
                        <View style={{ width:'100%', flexDirection:'row', paddingHorizontal:12, gap: 12 }}>

                            <View style={{paddingHorizontal: 12, justifyContent:'center' }}> 
                                <Checkbox 
                                    noLine 
                                    size={20} 
                                    text="全选"
                                    isChecked={Boolean(options.length === count)}
                                    textContainerStyle={{marginLeft:8}} 
                                    textStyle={{ fontSize:12, marginTop: -3 }} 
                                    onPress={onSelectAll} 
                                />
                            </View>

                            <ButtonCard bold={false} textProps={{ t4: true }}>保存到文件夹</ButtonCard>
                            <ButtonCard bold={false} color="red" disabled={!Boolean(count)} textProps={{ t4: true }} onPress={onRemoveHistory}>清空全部</ButtonCard>
                            <ButtonCard bold={false} color="red" disabled={!Boolean(count)} textProps={{ t4: true }} onPress={onRemoveItems}>删除{count ? `(${count})` : ''}</ButtonCard>
                        </View>
                    )
                }
                <ScrollView style={{ width:'100%', flex: 1, paddingHorizontal: 12 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap:12, }}>
                    {
                        options?.map(item=>{
                            return (
                                <Card key={item?.key} style={{ width:'100%', flexDirection: 'row'}}>
                                    {
                                        Boolean(state.isEdit) && (
                                            <Checkbox
                                                size={20} 
                                                unFillColor="#FFFFFF" 
                                                isChecked={state?.selected?.[item.key]}
                                                innerIconStyle={{ borderWidth: 2 }} 
                                                onPress={onSelectItem(item?.key)}
                                            />
                                        )
                                    }


                                    <View style={{ flex: 1, gap: 6 }}>
                                        <View style={{flexDirection:'row', justifyContent:'space-between', gap: 6}}>
                                            <Text t4> {item.timetamp}</Text>
                                            {
                                                item.type && <Image source={assets.platform?.[item.type]} style={{width:20, height:20}} />
                                            } 
                                        </View>
                                        
                                        <Text numberOfLines={2}>{item.title || item?.origin}</Text>
                                        <Text t4 style={{alignSelf:'flex-end'}}> {item.video ? '已下载': '未下载'}</Text>
                                    </View>
                                </Card> 
                            )
                        })
                    }
                </ScrollView> 
            </View> 
        </Layout>
    )
})


export default RouteDouyin