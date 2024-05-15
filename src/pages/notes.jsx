import { memo, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";
import Text from '@/common/components/Text'
import { useUpdate, useReceive } from "../hooks";
import DraggableGrid  from "@/components/Draggable";
import { auto, regex } from '@/common/common'
import Card from "@/components/Card";
import Fab from "@/components/Fab";
import Menu, { MenuItem, MenuDivider } from "@/components/Dropdown";
import Stagger from "@/common/components/Stagger";
import configs from '@/common/configs'
import Bounceable from "@/common/components/Bounceable";
import Icon from "@/common/components/Icon";
import Layout from "@/layout/Layout"; 

const screen = configs.screen

export default memo(({ navigation })=>{
    const { onGetNotes, onSetNotes, notesKey } = useReceive()
 
    const [state, setState] = useUpdate({
        // data: option,
        scrollEnabled: true 
    });

    const folders = useMemo(()=>{
        return onGetNotes('folders')
    },[notesKey])


    const onShowModal = (menu, title)=>{
        return ()=>{
            setState({ visible: false  }) 
            navigation.navigate('Modal', { name: 'Notes', title:title, menu: menu })
        } 
    }

    const onShowNote = (info)=>{
        return ()=>{
            navigation.navigate('Folder', { name: 'Notes', title: info?.name, key: info?.name })
        }
    }
 
   
    return (
        <Layout 
            renderRight={(
                <Menu
                    visible={state?.visible}
                    anchor={(
                        <Bounceable onPress={()=>setState({ visible: true })}>
                            <Icon icon="more" size={24} color="#bbb" />
                        </Bounceable>
                    )}
                    onRequestClose={()=>setState({ visible: false })}
                >
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit" size={16} color="#bbb" />)}>新建笔记</MenuItem>
                    <MenuDivider />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} onPress={onShowModal('folder', '新建文件夹')} renderRight={()=>(<Icon icon="folder-plus" size={16} color="#bbb" />)}>新建文件夹</MenuItem>
                    <MenuDivider style={{ borderBottomWidth: 6, borderColor: '#F1F1F1'}} />
            
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit-alt" size={16} color="#bbb" />)}>编辑文件夹</MenuItem>
                    <MenuDivider />
                    
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="delete" size={16} color="#bbb" />)}>删除文件夹</MenuItem>
                </Menu>
            )}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, gap: 12  }}>
                <Stagger
                    stagger={50}
                    duration={300}
                    exitDirection={-1}
                    style={{ gap: 12 }}
                > 
                    {
                        folders?.map(item=>{
                            return (
                                <Card key={item.name} style={{flex:1}} onPress={onShowNote(item)}>
                                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderRadius:8 }}>
                                        <View style={{ flexDirection:'row', alignItems:'center', gap:12,}}>
                                            <Icon icon={item.icon} size={24} color="#fde49e" />
                                            <Text>{item.name}</Text>
                                        </View>

                                        <View style={{ flexDirection:'row', gap:6, alignItems:'center'}}>
                                            <Text>{ auto.badge(item.count, 999) }</Text>
                                            <Icon icon="chevron-right" size={18} color="#bbb" />
                                        </View> 
                                    </View>
                                   
                                </Card> 
                            )
                        })
                    }
                </Stagger>
            </ScrollView> 
            <Fab
				buttonColor="red" 
				iconTextColor="#FFFFFF" 
				// onClickAction={onGoEditer()} 
				// visible={!state.visible} 
				iconTextComponent={<Icon icon="plus" color="#FFF" size={16 * 2} />} 
			/>
        </Layout>
    )
})