import React from 'react'
import { View, StyleSheet, ActivityIndicator, Dimensions, Pressable, Platform } from 'react-native' 
import RootSiblings from '@/provider/rooter';
// import PlayerCorner from '@/components/player-corner';
// import Galleryer from '@/components/gallery';
 
 
import Text from '@/common/components/Text';
import Icon from '@/common/components/Icon';
import Webviews  from './webview';

const { width, height } = Dimensions.get('window')

let sibling = undefined
let cliper = undefined
let player = undefined
let preview = undefined
let render = undefined
let webview = undefined


const Loading = {
    show: ({ delay = 1000, text='' } = {}) => { 
        Loading.hidden(); 
        sibling = new RootSiblings(
            <View style={styles.maskStyle}>
                <View style={styles.backViewStyle}>
                    <ActivityIndicator size="large" color="white" />
                    {
                        Boolean(text) && (
                            <View style={{ paddingVertical: 12 }}>
                                <Text style={{ fontSize:12, color:'#FFF'}}>{text}</Text>
                            </View>
                        )
                    }
                </View>
            </View>
        ) 
        if(delay){
            setTimeout(()=>{
                Loading.hidden()
            }, delay)
        }
    },

    // preview:(images)=>{
    //     preview = new RootSiblings( 
    //         <Galleryer
    //             data={images}
    //             onSwipeToClose={() =>void Loading.hidden(preview)}
    //         /> 
    //     )
    // },

    // corner:({ position, currentTime, ...arg }, callback)=>{
    //     player = new RootSiblings(
    //         <PlayerCorner
    //             currentTime={ currentTime}
    //             positions={position}
    //             props={{ videoProps: arg }}
    //             onClose={()=>{
    //                 Loading.hidden(player)
    //                 callback()
    //             }}
    //         /> 
    //     )
    // },

    cliper: (copy, callback)=>{ 
        if(!copy){ return }
        let dom = (
            <View
                style={[styles?.elevation, {
                    position: 'absolute',
                    alignItems:'center',justifyContent:'center',
                    width: 32 * 1.8, height: 32 * 1.5,
                    bottom: 24 * 3, right: 24,
                    borderRadius: 3,padding: 6,
                }]}
            >
                <Pressable
                    style={{ alignSelf: 'center' }}
                    onPress={()=>{
                        callback(copy);
                        Loading?.hidden(cliper);
                    }}
                >
                    <Icon icon="copy-add" size={24} color="#41B06E" />
                </Pressable>
            </View>
        );
        // cliper ? cliper.update(dom) : ( cliper = new RootSiblings(dom) );
    },

    render: (dom)=>{
        render = new RootSiblings(dom)
        return render
    },

    hidden: (node = sibling)=> {
        if (node instanceof RootSiblings) {
            node.destroy()
        }
    },


    webview: ({ uri, runJs, runMsg, source,  runLoad, callback })=>{ 
        const onClose = (res)=>{
            callback(res)
            Loading.hidden(webview)
        }

        webview = Loading.render(
            <View style={{ width:1, height:1,  position: 'absolute', top: -1, right: -1 }}>
                <Webviews 
                    uri={uri}
                    source={source}
                    runJs={runJs}
                    runMsg={runMsg}
                    runLoad={runLoad}
                    callback={onClose}
                />
            </View>
        )
    }


}

const styles = StyleSheet.create({
    maskStyle: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      width: width,
      height: height + 24,
      alignItems: 'center',
      justifyContent: 'center'
    },
    backViewStyle: {
      backgroundColor: '#111',
      width: 120,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
    },
    elevation:{
        backgroundColor: '#FFF', 
        ...Platform.select({
            ios: {
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
    }
  }
)

export default Loading

/**
 * Loading.show()
 * Loading.hidden() 
 */