import { memo, useCallback, useMemo, useRef } from "react";
import { View, ScrollView } from "react-native";
 
import Text from '@/common/components/Text' 
import Card from "@/components/Card";  
import Layout from "@/layout/Layout"; 
import Input from "@/components/Input";

const RouteNotes = memo(({ title,  other, navigation })=>{
    const { current } = useRef({
        content: '新建文件夹',
        init: true,
    });
 
 
    return (
        <Layout
            title={title}
            renderLeft={(
                <Text color="#f3ca52">取消</Text>
            )}
            renderRight={(
                <Text color="#f3ca52">完成</Text>
            )} 
            onLeftPress={()=>navigation?.goBack()}
            onRightPress={()=>navigation?.goBack()}
        >
            <View style={{ padding: 12  }}>
                {
                    other?.menu === 'folder' && (
                        <Input
                            placeholder=""
                            value={current?.content}
                            autoFocus
                            clearButtonMode="always"
                            selectTextOnFocus={current.init}
                            onChangeText={text=>{  
                                current.content = text
                                if(current.init){
                                    current.init = false
                                }
                            }}
                            textInputStyle={{ flex: 1  }}
                            iconStyle={{ backgroundColor:'white',  }}
                        />
                    )
                }
            </View>
        </Layout>
    )
})


export default RouteNotes