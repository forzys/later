import { memo } from "react";
import { View, ScrollView, Text as RNText } from "react-native";
import { useFontFace } from "@/hooks/index";  
import configs from '@/common/configs'
import Text from '@/common/components/Text'
import Layout from '@/layout/Layout'
import AppOfTheDayCard from '@/components/card/dayApp'  
import Loading from "@/components/Loading";
import SimpleCard from "@/components/Card";

const { width } = configs.screen

const Fonts = memo(({ navigation })=>{
    const { fonts, onLoadFonts, onUseFonts, fontName, onQueryFonts } = useFontFace();   
  
    return (
        <Layout>
            <ScrollView  style={{ flex: 1, }} contentContainerStyle={{ paddingVertical: 12, gap: 0, gap:12, alignItems:'center' }}>
                <View style={{ flexDirection:'row', width: (width * 0.9), justifyContent:'flex-end', gap: 12 }}>
                    <SimpleCard onPress={()=>{ onUseFonts(); }}>
                        <RNText style={fontName === 'Roboto' ? { color: '#056dff' } : { }}>默认字体</RNText>
                    </SimpleCard>

                    <SimpleCard onPress={()=>{ 
                        onQueryFonts();
                        Loading.show({ 
                            text: '更新中...',
                            delay: 1000,
                        });
                    }}>
                        <Text>更新</Text>
                    </SimpleCard>
                </View>

                {
                    fonts?.map(item=>{
                        return (
                            <AppOfTheDayCard
                                full={false}
                                key={item?.FontName}
                                title={item?.FontName}
                                subtitle={"下载 & 使用字体"} 
                                buttonText={item?.LocalPath ? item.FontName === fontName ? "已使用" : "使用": "下载"}
                                iconSource={'fontisto'}
                                iconStyle={{ color: '#F1F1F1'}}
                                backgroundSource={{ uri:  item.Preview }}
                                buttonSubtitle={`${item.FileSize} 免费`}
                                resizeMode="contain"
                                bottomBarStyle={{ backgroundColor:'rgba(0,0,0,0.3)'}}
                                onPress={() => {}}
                                onButtonPress={() => {
                                    if(item?.LocalPath){
                                        Loading.show({ 
                                            text: '正在使用字体...',
                                            delay: 1000,
                                        });
                                        onUseFonts(item);
                                    }else{
                                        onLoadFonts(item);
                                        Loading.show({ 
                                            text: '正在下载字体...',
                                            delay: 5000,
                                        }) 
                                    } 
                                   
                                }}
                                style={{
                                    width: (width * 0.9),
                                    height: (width * 0.9 * 0.67),
                                }}
                            />
                        )
                    })
                } 
                
                <View>
                    <Text style={{color:'#BBB' }}>更多内容正在准备</Text>
                </View>
            </ScrollView> 
        </Layout>
    )
})

export default Fonts