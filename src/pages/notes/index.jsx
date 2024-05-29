import { memo, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";
import Text from '@/common/components/Text'
import { useUpdate, useReceive } from "@/hooks/index";
import DraggableGrid  from "@/components/Draggable";
import { auto, regex } from '@/common/common'
import Card from "@/components/Card";
import Fab from "@/components/Fab";
import RNBounceable from '@/common/components/Bounceable';
import Menu, { MenuItem, MenuDivider } from "@/components/Dropdown";
import Stagger, { FadeInDown } from "@/common/components/Stagger";
import configs from '@/common/configs'
import Modal from "@/components/Modal";
import Bounceable from "@/common/components/Bounceable";
import Icon from "@/common/components/Icon";
import Layout from "@/layout/Layout"; 
 
const { height } = configs.screen  
 
export default memo(({ navigation })=>{
    const { onGetNotes, onSetNotes, notesKey } = useReceive()
 
    const [state, setState] = useUpdate({
        // data: option,
        scrollEnabled: true 
    });

    const folders = useMemo(()=>{
        return onGetNotes('folders')
    },[notesKey])


    const onShowModal = (menu, title, value)=>{
        return ()=>{
            setState({ visible: false  }); 
            navigation.navigate('Modal', { name: 'Notes', title:title, menu: menu,  value: value  })
        } 
    }

    const onAddNote = (title, key)=>{
        return ()=>{
            navigation.navigate('Editer', { name: 'Notes', title: title, key: key  })
        }
    }

    const onShowNote = (info)=>{
        return ()=>{

            if(state.edit){
                return 
            }


            navigation.navigate('Folder', { name: 'Notes', title: info?.name, key: info?.name })
        }
    } 
   

    const onFolderEdit = ()=>{
        setState({ edit: true, visible: false  })
    }


    return (
        <Layout
            freeze={false}
            renderRight={(
                <Menu
                    visible={state?.visible}
                    style={{ marginTop: 24 }}
                    anchor={(
                        <Bounceable onPress={()=> state.edit ? setState({ edit: false  }) : setState({ visible: true })}>
                            {
                                state.edit ? (
                                    <Text>完成</Text>
                                ): <Icon icon="more" size={24} color="#bbb" />
                            }
                        </Bounceable>
                    )}
                    onRequestClose={()=>setState({ visible: false })}
                >
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit" size={16} color="#bbb" />)}>新建笔记</MenuItem>
                    <MenuDivider />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} onPress={onShowModal('folder', '新建文件夹')} renderRight={()=>(<Icon icon="folder-plus" size={16} color="#bbb" />)}>新建文件夹</MenuItem>
                    <MenuDivider style={{ borderBottomWidth: 6, borderColor: '#F1F1F1'}} />
            
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} onPress={onFolderEdit} renderRight={()=>(<Icon icon="edit-alt" size={16} color="#bbb" />)}>编辑文件夹</MenuItem>
                    <MenuDivider />
                    
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="delete" size={16} color="#bbb" />)}>删除文件夹</MenuItem>
                </Menu>
            )}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{  padding: 12, gap: 12  }}>


                <View style={{width:'100%', height: 12}}>

                </View>
                 
                <Stagger 
                    stagger={50}
                    duration={300}
                    exitDirection={-1}
                    entering={() => FadeInDown.duration(400)}
                    exiting={null}
                    style={{ backgroundColor: '#FFF', borderRadius: 6 }}
                > 
                    {
                        folders?.map((item, index)=>{
                            return (
                                <View key={item.name + index} style={{ paddingHorizontal: 12, paddingRight:0, gap: 12,  flex: 1,  flexDirection:'row', alignItems:'center'  }}> 
                                    <Icon icon={item.icon} size={24} color="#fde49e"  />
                                    
                                    <Bounceable onPress={onShowNote(item)} onLongPress={()=> state.edit ? null: setState({ modal: true })} style={{  padding: 12, paddingLeft: 0, flex: 1, borderTopColor:'#f1f1f1', borderTopWidth: index ? 1 : 0,  flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:12, }}> 
                                        <Text>{item.name}</Text>  
                                        {
                                            state.edit ? (
                                                <View style={{ flexDirection:'row', gap:12, alignItems:'center' }}>
                                                    <Icon icon="edit" size={18} color="#987070" style={{marginTop: 1}} onPress={onShowModal('folder', '重命名文件夹', item.name)} />
                                                    <Icon icon="delete" size={18} color="#DC5F00" style={{marginTop: 1}} />
                                                </View>
                                            ): (
                                                <View style={{ flexDirection:'row', gap:6, alignItems:'center'}}>
                                                    <Text>{ auto.badge(item.count, 999) }</Text>
                                                    <Icon icon="chevron-right" size={18} color="#bbb" style={{marginTop: 1}} />
                                                </View>
                                            )
                                        }
                                    </Bounceable> 

                                       
                                </View> 
                            )
                        })
                    }
                </Stagger>


                <View style={{ paddingTop: 24, alignItems:'center' }}>
                    <Text color="#d1d1d1">笔记 & 备忘 & 待办</Text> 
                </View>
            </ScrollView> 
  
            <Fab
				buttonColor="#afafaf"
                size={120}
                fabStyle={{ height: 48,  overflow: 'hidden'}}
                visible={!state.edit}
                position={{ right: 0, }}
			>  
                <View style={{  flex: 1, gap: 12,  flexDirection:'row', alignItems:'center', justifyContent: 'space-between'}}> 
                    <Bounceable style={{ padding: 6 }}  onPress={onShowModal('folder', '新建文件夹')}>
                        <Icon icon="folder" color="#fff" size={24} />
                    </Bounceable>

                    <Bounceable style={{ padding: 6 }} onPress={onAddNote('全部')}>
                        <Icon icon="edit-alt" color="#fff" size={24} />
                    </Bounceable> 
                </View>
            </Fab>


            <Modal
                visible={state.modal}
                dialogStyle={{ height: height * 0.6, backgroundColor:'#fff' }}
                onTouchOutside={()=> setState({ modal: false  })}
            > 

                <View>
                    <Text>22</Text>
                </View>
                    
            </Modal> 

        </Layout>
    )
})