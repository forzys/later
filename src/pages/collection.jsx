import { memo, useState } from "react";
import { View, ScrollView } from "react-native";
import Text from '@/common/components/Text'
import { useUpdate } from "../hooks";
import DraggableGrid  from "@/components/Draggable";
import { auto, regex } from '@/common/common'
import Card from "@/components/Card";
import Menu, {MenuItem} from "@/components/Dropdown";
import Stagger from "@/common/components/Stagger";
import configs from '@/common/configs'
import Bounceable from "@/common/components/Bounceable";
import Icon from "@/common/components/Icon";
import Layout from "@/layout/Layout"; 

const screen = configs.screen

const Home = memo(()=>{
    const [option] = useState([
        {key:1, name: '全部', icon: 'folder', count: 20, info: {} },
        {key:2, name: '共享文件夹', icon: 'folder-share', count: 900 },
        {key:3, name: '媒体文件夹', icon: 'folder-share', count: 900 },
        {key:4, name: '私密文件夹', icon: 'folder-lock',count: 100000 },
        {key:5, name: '最近删除', icon: 'delete', count: 2 }, 
    ]);

    const [state, setState] = useUpdate({
        data: option,
        scrollEnabled: true 
    });

    const onShowModal = (info)=>{
        return ()=>{
            navigation.navigate('Modal', { name: 'note', ...info })
        } 
    }
 
   
    return (
        <Layout 
            rightRender={(
                <Menu
                    visible={state?.visible}
                    anchor={(
                        <Bounceable onPress={()=>setState({ visible: true })}>
                            <Icon icon="more" size={24} color="#bbb" />
                        </Bounceable>
                    )}
                    onRequestClose={()=>setState({ visible: false })}
                >
                    <MenuItem onPress={onShowModal('folder')}>新建文件夹</MenuItem>
                    <MenuItem>新建笔记</MenuItem>
                    <MenuItem>编辑文件夹</MenuItem>
                    <MenuItem disabled>更多样式</MenuItem>
                </Menu>
            )}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 12, gap: 12  }}>
                <Stagger
                    stagger={50}
                    duration={300}
                    exitDirection={-1}
                    style={{ gap: 12  }}
                > 
                    {
                        state?.data?.map(item=>{
                            return (
                                <Card key={item.key}>
                                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', width: screen.width - 24 * 2 , borderRadius:8 }}>
                                        <View style={{ flexDirection:'row',  gap:12,}}>
                                            <Icon icon={item.icon} size={24} color="#fde49e" />
                                            <Text>{item.name}</Text>
                                        </View>

                                        <Text>{ auto.badge(item.count, 999) }</Text>
                                    </View>
                                   
                                </Card> 
                            )
                        })
                    }
                </Stagger>
            </ScrollView> 
        </Layout>
    )
})

export default Home