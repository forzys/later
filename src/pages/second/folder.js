import { memo, useMemo } from "react";
import { View, ScrollView } from "react-native";
import Text from '@/common/components/Text'
import { useUpdate, useReceive } from "@/hooks/index";
import Card, { ButtonCard, WarpCard } from "@/components/Card";
import Menu, { MenuItem, MenuDivider} from "@/components/Dropdown";
import Stagger from "@/common/components/Stagger"; 
import Bounceable from "@/common/components/Bounceable";
import Icon from "@/common/components/Icon";
import Layout from "@/layout/Layout";
import Checkbox from '@/components/Checkbox' 
import Fab from '@/components/Fab';  

export default memo(({ navigation, route })=>{
	const { onGetNotes, onSetNotes, notesKey, onDeleteNoteItem } = useReceive()
 
    const [state, setState, { cache }] = useUpdate({
        data: [],
		selected:{},
        scrollEnabled: true 
    });

	const [title = '', key,  notes = [], folders] = useMemo(()=>{
		const { title, key } = route?.params
		const notes = onGetNotes('folder.' + key)
		const folders = onGetNotes('folders')
		return [title, key,  notes, folders]
	},[route?.params, notesKey])

	const count = useMemo(()=>{
        return Object.keys(state.selected)?.length
    },[state.selected])
 
     
	const onSelectItem = (key)=>{
        return (isChecked)=>{
            const selected = {...state?.selected } 
            isChecked ? (selected[key] = true) : (delete selected[key]);
            cache.selected = selected 
            setState({ selected })
        }
    } 
	const onEdit = ()=>{
		setState({ isEdit: true, visible: false  })
	}

	const onRemoveItems = ()=>{
		const selected = {...state?.selected }
		const keys = Object.keys(selected)
		for(let key of keys){
			onDeleteNoteItem('note.' + key)
		} 
		const option = notes?.filter(i=> !selected[i.key])
		onSetNotes('folder.' + key, option);

		const inx = folders?.findIndex(i=>i?.name === title);
 
        if(inx !== -1){
            const item = folders[inx] 
            item.count = option.length;
            folders[inx] = item 
            onSetNotes('folders', folders)
        }
	}

	const onSelectAll = (isChecked)=>{
		const keys = {} 
        if(isChecked){
            for(let item of notes){
                keys[item?.key] = true
            }
        }
        setState({ selected: keys }) 
	}

    const onGoEditer = (info)=>{
        return ()=>{
			const key = info?.key 
			if(state.isEdit){
				const selected = {...state?.selected } 
				selected[key] ? (delete selected[key]) : (selected[key] = true)
				cache.selected = selected 
				return setState({ selected }) 
			}
			
            navigation.navigate('Editer', { name: 'Notes', title: title, key: key  })
        } 
    }
 
   
    return (
        <Layout 
			title={title} 
			leftIcon={state?.isEdit ? "" : "chevron-left"}
			onLeftPress={()=>navigation.goBack()}
            renderRight={(
				state?.isEdit ? (
					<Text onPress={()=>setState({ isEdit: false })}>完成</Text>
				):
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
					<MenuDivider style={{ borderBottomWidth: 6, borderColor: '#F1F1F1'}} />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="folder-share" size={16} color="#bbb" />)} onPress={onEdit}>选择笔记</MenuItem>
                    <MenuDivider />
					<MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="folder-share" size={16} color="#bbb" />)}>共享文件夹</MenuItem>
					<MenuDivider />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="folder-lock" size={16} color="#bbb" />)}>加密文件夹</MenuItem>
					<MenuDivider />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="edit-alt" size={16} color="#bbb" />)}>重命名文件夹</MenuItem>
					<MenuDivider style={{ borderBottomWidth: 6, borderColor: '#F1F1F1'}} />
                    <MenuItem style={{paddingHorizontal: 12, justifyContent:'space-between'}} renderRight={()=>(<Icon icon="delete" size={16} color="#bbb" />)}>删除文件夹</MenuItem>
                </Menu>
            )}
        >
			   {
                    state.isEdit && (
                        <View style={{ width:'100%', flexDirection:'row', paddingHorizontal:12, gap: 12 }}>
                            <View style={{paddingHorizontal: 12, justifyContent:'center' }}> 
                                <Checkbox 
                                    noLine 
                                    size={20} 
                                    text="全选"
                                    isChecked={Boolean(notes.length === count)}
                                    textContainerStyle={{marginLeft:8}} 
                                    textStyle={{ fontSize:12, marginTop: -3 }} 
                                    onPress={onSelectAll} 
                                />
                            </View> 
                            <ButtonCard bold={false} color="red" disabled={!Boolean(count)} textProps={{ t4: true }} onPress={onRemoveItems}>删除{count ? `(${count})` : ''}</ButtonCard>
                        </View>
                    )
                }
            <ScrollView style={{ flex: 1,  }} contentContainerStyle={{ padding: 12 }}>
				{
					notes?.length ? ( 
						<WarpCard> 
							<Stagger
								stagger={50}
								duration={300}
								exitDirection={-1}
								style={{ gap: 12  }}
							>
								{ 
									notes?.map((item, index)=>{
										return (
											<Bounceable key={item?.key} style={{ width:'100%', flexDirection: 'row'}} onPress={onGoEditer(item)}>
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
												<View style={{ width:'100%', flex: 1,  gap: 0 }}> 
													<Text h4 color="#000">{item.title}</Text> 
													<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap: 6, flex: 1 }}>
														<Text numberOfLines={1}>{item.subtitle}</Text>
														<View style={{flexDirection:'row', alignItems:'center', gap: 12}}>
															<View style={{flexDirection:'row', alignItems:'center', gap:3 }}>
																<Icon icon="folder" size={14} />
																<Text t4>{item.folder}</Text>
															</View> 

															<Text t4>{item.time}</Text>
														</View>
														
													</View>

													{
														(index + 1) < notes?.length && (
															<MenuDivider style={{ paddingVertical: 2 }} /> 
														)
													} 
												</View> 
											</Bounceable> 
										)
									})
								}
							</Stagger>
						</WarpCard>
					): (
						<View style={{ paddingHorizontal: 12 }}>
							<Text color="#bbb">暂无笔记 创建一个吧</Text>
						</View> 
					)

				}
            </ScrollView> 

			<Fab
				buttonColor="red" 
				iconTextColor="#FFFFFF" 
				onClickAction={onGoEditer()} 
				// visible={!state.visible} 
				iconTextComponent={<Icon icon="plus" color="#FFF" size={16 * 2} />} 
			/>
        </Layout>
    )
})