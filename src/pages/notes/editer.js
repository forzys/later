import { useMemo, memo, useEffect, useRef, useCallback } from 'react'; 
import { Button, ScrollView, View, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable } from 'react-native'; 
// import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
// import { ScrollView } from 'react-native-gesture-handler';
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon' 
import Snakbar from '@/components/Snakbar'
import Layout from '@/layout/Layout';
import Fab from '@/components/Fab';  
import configs from '@/common/configs';
import {auto} from '@/common/common'; 
import htmlParser from '@/common/lib/htmlParser'
import { useUpdate, useReceive } from '@/hooks';

const { screen,  devices } = configs
 
const Editer = memo(({ route, navigation }) =>{
    const richText = useRef();
    const scrollRef = useRef();
    const { onGetNotes, onSetNotes } = useReceive()
	const [state, setState, { ref, cache }] = useUpdate({
		value: '',
        visible: false,
	});
  
    const [title = '', key, folders] = useMemo(()=>{
        const { key, title } = route?.params; 
        if(!title){
            return []
        }
        const folders = onGetNotes('folders'); 
        const _key = key ? key : auto.uuid();
        return [title, _key, folders]
	},[route?.params])
	 

	const onTextChange = (value, a)=>{ 
        cache.value = value
		// setState({ value: value, selection: null })
	}


    const onSaveEditer = ()=>{ 
        const value = cache.value  
        const rootNode = htmlParser(value); 
        const divs = rootNode.getElementsByTagName('div')
 
        // const [_title = '', _subtitle = ''] = note.split('\n')?.filter(Boolean);

        const notes = onGetNotes('folder.' + title); 
        const index = notes.findIndex(i=> i?.key === key);
        const had = index === -1;

        notes.splice(had ? 0 : index, had ? 0 : 1, {
            key: key,
            folder: title,
            // title: _title?.replace(/#+/g, '')?.replace(/>/g, '')?.trim(),
            // subtitle: _subtitle?.replace(/#+/g, '')?.replace(/>/g, '')?.trim(), 
            time: auto?.dateFormat()?.format('YYYY/MM/DD'),
        });

        // const inx = folders?.findIndex(i=>i?.name === title);
        
        // if(inx !== -1){
        //     const item = folders[inx] 
        //     item.count = notes.length;
        //     folders[inx] = item 
        //     onSetNotes('folders', folders)
        // }
        // onSetNotes('folder.' + title, notes)
        // onSetNotes('note.' + key, note);
    }


    const onNoteSave = ()=>{ 
        onSaveEditer();
        richText.current?.blurContentEditor(); 
    }
    const onNoteWithBack = ()=>{
        // onSaveEditer();
        navigation.goBack()
    }


    // const onKeyShow = useCallback(() => {
    //     TextInput.State.currentlyFocusedInput() && setEmojiVisible(false);
    //   }, []);

    const onKeyShow = ()=>{
        setState({ visible: true, toolbar: true  })
    }

    const onKeyHide = ()=>{
        setState({ visible: false, toolbar: false }); 
        richText.current?.blurContentEditor(); 
    }

    const handleEmoji = ()=>{ 


        if(state?.emoji){
            richText.current?.focusContentEditor(); 
        }else{
            richText.current?.dismissKeyboard(); 
        }

        setState({ emoji: !state?.emoji })
      
    }

    const handleCursorPosition = useCallback((scrollY) => {
        // Positioning scroll bar
        scrollRef.current.scrollTo({ y: scrollY - 30, animated: true});
      }, []);

    useEffect(()=>{
        if(key){
            const value = onGetNotes('note.' + key, ''); 
            cache.value = value 
            setState({ })
        } 

        let listener = [ 
            Keyboard.addListener('keyboardDidShow', onKeyShow),
            Keyboard.addListener('keyboardDidHide', onKeyHide),
        ];

        return ()=>{
            listener.forEach(it => it.remove());
        } 
    },[key])
   
	return (
		<Layout 
            title=""
            renderLeft={(
                <Pressable onPress={onNoteWithBack} style={{ flexDirection:'row', justifyContent:'flex-start', alignItems:'center', gap: 12  }}>
                    <Icon icon="chevron-left" size={24} color="#bbb" />
                    <Text>{title}</Text> 
                </Pressable>
            )}
            renderRight={(
                <View style={{ flexDirection:'row',  alignItems:'center', gap: 12  }}>
                    <Icon icon="share" size={22} color="#feb941"  />
                    
                    <Text onPress={onNoteSave}>完成</Text>
                        
                </View> 
            )}
        >
            <View style={{ flex: 1, padding: 12, }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}	style={{ flex: 1, overflow:'hidden', borderRadius: 5, }}>
                    <RichEditor 
                        ref={richText} 
                        initialContentHTML={cache.note}
                        onChange={onTextChange}
                        style={{ flex: 1, opacity: 0.99,  overflow:'scroll' }} 
                        initialFocus={false}
                        firstFocusEnd={false} 
                        pasteAsPlainText={true}
                        onCursorPosition={handleCursorPosition} 
                        useContainer={false}
                        enterKeyHint='done' 
                        // onFocus={()=>setState({ visible: true })}
                        // onBlur={()=>setState({ visible: false })}
                    /> 
                </KeyboardAvoidingView> 
            </View> 

             
             
            <Snakbar backgroundColor="#F1F1F1" visible={state.visible && state.toolbar}> 

                {/* <View style={{flex: 1}}>  */} 
                    <View style={{ flexDirection:'row', width:'100%', alignItems:'center', paddingRight: 12}}> 
                        <RichToolbar
                            editor={richText}
                            actions={[
                                actions.undo,
                                actions.redo,

                                actions.insertVideo,
                                actions.insertImage,

                                actions.setStrikethrough,
                                actions.checkboxList,
                                actions.insertOrderedList,

                                actions.blockquote,
                                actions.alignLeft,
                                actions.alignCenter,
                                actions.alignRight,

                                actions.code,
                                actions.line,

                                // actions.foreColor,
                                // actions.hiliteColor,

                                actions.insertBulletsList, 

                                actions.setBold, 
                                actions.setItalic, 
                                actions.setUnderline, 
                                // actions.insertLink,

                                actions.heading1,
                                actions.heading4,
                                // 'insertEmoji',
                            ]}
                        
                            style={{
                                width:'92%',
                                paddingHorizontal:12,
                                paddingRight: 12,
                                alignItems:'flex-start',
                            }}
                            // insertEmoji={handleEmoji} 
                            iconMap={{ 
                                // insertEmoji: ()=><Icon icon="emoji-laughing" size={20} color="#a1a1a1" />,
                                [actions.heading1]: ({tintColor}) => <Text style={[styles.tib, {color: tintColor}]}>H1</Text>, 
                                [actions.heading4]: ({tintColor}) => <Text style={[styles.tib,{color: tintColor}]}>H4</Text>, 
                            }}
                            selectedButtonStyle={{
                                backgroundColor:'#FFF',
                                margin: 3,
                                borderRadius: 3,
                            }}
                            unselectedButtonStyle={{
                                margin: 3,
                            }}
                        />
                        <View style={{ padding: 8, }}>
                            <Icon icon="close" color="#a1a1a1" size={20} onPress={()=>{ setState({ toolbar: false }) }} />
                        </View> 
                    </View>
                    {/* <View style={{ flex: 0, display: state.emoji ? 'flex' : 'none'  }}> 
                        <View
                            style={{
                                alignSelf: 'center',
                                flexWrap: 'wrap',
                                flexDirection: 'row', 
                                width: '100%', 
                                gap: 12,
                                paddingHorizontal: 12,
                            }}
                        >
                            {
                                [
                                    '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', 
                                    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
                                    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
                                    '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', 
                                    '😞', '😔', '😟', '😕', '🙁', '😣', '😖', 
                                    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', 
                                    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', 
                                    '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', 
                                    '🤫', '🤥', '😶'
                                ].map(i=>{
                                    return (
                                        <Text key={i} style={{ backgroundColor:'red', width: 42, fontSize: 20, padding: 5, textAlign:'center' }}>
                                            {i}
                                        </Text>
                                    )
                                }) 
                            } 
                        </View>
                    </View>  */}
                {/* </View> */}
            </Snakbar> 

          
            <Fab
				buttonColor="#ddd" 
				iconTextColor="#FFFFFF" 
				onClickAction={()=>setState({ toolbar: true })} 
                size={48}
                position={{
                    right: 0, 
                    bottom: 0,
                }}
                bottom={1}
				visible={state.visible && !state.toolbar} 
				iconTextComponent={<Icon icon="plus" color="#FFF" size={18} />} 
			/>
		</Layout>
	);
})

export default Editer


const styles =StyleSheet.create({
    tib: {
        textAlign: 'center',
        color: '#515156',
    },
    
})