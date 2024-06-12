import { memo, useState, useEffect, useRef } from "react";
import Layout from "@/layout/Layout";
import { ScrollView, View, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native"; 
import { SectionGrid } from "@/components/Grid";
import Text from "@/common/components/Text";
import Icon from "@/common/components/Icon";
import fetcher from "@/common/fetcher";
import RNBounceable from '@/common/components/Bounceable';
import { useAuth } from "@/hooks/index"; 
import Snakbar from '@/components/Snakbar'
import { useUpdate, useReceive } from '@/hooks'; 
import SimpleCard, { WarpCard  }  from "@/components/Card";
// import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
// import { QueueInitialTracksService, SetupService } from '../play';
import Video from 'react-native-video';
import {Received} from "@/components/Progress";
  
 
const Sleep = memo(({ navigation })=>{ 
    const progressRef = useRef(null)
    const videoRef = useRef(null)

    const { sleeps } = useAuth();  
    const [state, setState] = useUpdate({
        visible: true,
        plays: {}, 
    })

  

    const onSelectItem = (item)=>{
        return async ()=>{
            const { plays } = state 
            const playing = plays[item.name] || false
    
            if(playing){
                setState({  plays:{ name: item.name }})  
                return 
            }

            

            setState({ 
                plays:{
                    name: item.name, 
                    playing: false,
                    loading: true,
                    [item.name]: !playing
                }
            })

            progressRef?.current?.setProgress('Loading...')

            fetcher.get(item.uri, { path: `${item.name}.mp3` }, (received, total)=>{
                progressRef?.current?.setProgress(Math.floor((received / total) * 100) + '%')
            }).then((res)=>{ 
                setState({ 
                    plays:{
                        name: item.name,
                        uri: res.path,
                        loading: false,
                        playing: !playing,
                        [item.name]: !playing
                    }
                }) 
            }) 
        }
    }
  
 
    return (
        <Layout back>
            <View style={{ flex: 1, padding: 12, paddingBottom:0  }}>
                <SectionGrid
                    itemDimension={90}
                    sections={sleeps} 
                    renderItem={({ item, section, index }) => (
                        <RNBounceable onPress={onSelectItem(item)}>
                            <View style={{height: 150, gap: 6, borderRadius: 5, alignItems:'center', justifyContent:'center', backgroundColor:  state?.plays?.name === item.name ? '#000' : section.color }}>
                                <View style={{ width: 50, height: 50, alignItems:'center', justifyContent:'center', borderRadius: 50, }}> 
                                        {
                                            state.plays.name  === item.name ? 
                                               
                                                state.plays.loading ? (
                                                    <Received ref={progressRef} init={'loading'} style={{color:'#FFF', fontSize:12}} />
                                                ) : <Icon icon="pause-circle" size={30} color="#FFF" />
                                           
                                              : (
                                                <Icon icon="play-circle" size={30} color="#FFF" />
                                            ) 
                                        }
                                    
                                </View> 
                                <Text style={styles.itemCode}>{item.name}</Text>
                                <Text style={styles.itemCode}>{item.cname}</Text>
                        
                            </View>
                        </RNBounceable> 
                    )}
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}> 
                            <View style={{  height: 40, borderRadius:40, overflow:'hidden', alignItems:'center', justifyContent:'center' }}>
                                <Text  style={{fontWeight:"700", fontSize:12}}>{section.title}</Text>
                            </View> 
                        </View>
                    )}
                    style={{flex: 1}}
                />  
            </View>

            <View style={{ height: 60 }}>
                <Video paused={!state?.plays.playing} audioOnly repeat={true} autoplay={true} source={{ uri: state?.plays.playing ? state.plays.uri : '' }} style={{ position: 'absolute', width:0, height:0, bottom: -1, right:-1 }} playInBackground={true}  />

                <Snakbar backgroundColor="#475a55" visible={state.visible}> 
                    <View style={{ flexDirection:'row', gap: 12, width:'100%', height:60, paddingHorizontal: 24, alignItems:'center' }} > 
                        <Icon icon={state?.plays.playing ? "pause-circle" : "play-circle"} 
                            size={28} color="#FFF" 
                            onPress={async ()=>{
                                setState({
                                    plays:{
                                        ...state?.plays,
                                        playing: !state?.plays.playing,
                                        [state.plays.name]: !state?.plays.playing
                                    }
                                })
                            }} 
                        />
                        <View>
                            <Text color="#FFF">{state?.plays?.name}</Text>
                        </View>
                    </View> 
                </Snakbar>
            </View> 
        </Layout>
    )
})

export default Sleep

const styles = StyleSheet.create({
    gridView: {
      marginTop: 20,
      flex: 1,
    },
    itemContainer: {
        backgroundColor:'#03301F',
        justifyContent: 'flex-end',
        alignItems:'center',
        borderRadius: 5,
        padding: 10,
        height: 120,
    },
    itemName: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '600',
    },
    itemCode: {
      fontWeight: '600',
      fontSize: 12,
      color: '#fff',
    },
    sectionHeader: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      alignItems: 'center',
    //   backgroundColor: '#636e72',
      color: 'white',
      padding: 10,
    },
  });