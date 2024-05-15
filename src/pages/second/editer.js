import { useMemo, memo, useEffect } from 'react'; 
import { Button, ScrollView, View } from 'react-native'; 
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'

import Layout from '@/layout/Layout';
import configs from '@/common/configs';
import {auto} from '@/common/common';
// import Snakbar from '@/components/Snakbar';
// import Fab from '@/components/Fab';
// import Bounceable from '@/common/components/Bounceable'
// import {ActionButton} from '@/components/Button'
// import {ButtonCard} from '@/components/Card'
// import dayjs from 'dayjs'; 
import { useUpdate, useReceive } from '@/hooks';

const { screen } = configs
 
const Editer = memo(({ route, navigation }) =>{
    const { onGetNotes, onSetNotes } = useReceive()
	const [state, setState, { ref, cache }] = useUpdate({
		value: '',
	})

    const [title = '', key, folders] = useMemo(()=>{
        const { key, title } = route?.params; 
        if(!title){
            return []
        } 
        const folders = onGetNotes('folders'); 
        const _key = key ? key : auto.uuid();
        return [title, _key, folders]
	},[route?.params])
	 

	const onTextChange = (value)=>{
		setState({ value: value, selection: null })
	}

    const onNoteSave = ()=>{
        if(!ref.current?.isFocused()){
            return
        }
        const note = state.value 
        const [_title = '', _subtitle = ''] = note.split('\n')?.filter(Boolean);

        const notes = onGetNotes('folder.' + title); 
        const index = notes.findIndex(i=> i?.key === key)
        const had = index === -1
        
        notes.splice(had ? 0 : index, had ? 0 : 1, {
            key: key,
            folder: title,
            title: _title?.replace(/#+/g, '')?.replace(/>/g, '')?.trim(),
            subtitle: _subtitle?.replace(/#+/g, '')?.replace(/>/g, '')?.trim(), 
            time: auto?.dateFormat()?.format('YYYY/MM/DD'),
        });

        const inx = folders?.findIndex(i=>i?.name === title)
        if(inx !== -1){
            const item = folders[inx] 
            item.count = notes.length;
            folders[inx] = item 
            onSetNotes('folders', folders)
        }
      
        onSetNotes('folder.' + title, notes)
        onSetNotes('note.' + key, note);

        ref?.current?.blur()
    }

    useEffect(()=>{
        if(key){
            const value = onGetNotes('note.' + key, '');
 
            setState({ value: value })
        }

    },[key])

	// const addTag = (tag, posi)=>{
	// 	return (event)=>{
	// 		event.preventDefault();
	// 		const { start,  end } = ref?.selection || {}
	// 		let value = state.value
	// 		if(start === end){
	// 			value = value?.slice(0, end) + tag + value?.slice(end)
	// 			if(!!posi){
	// 				setState({ selection: end + tag.length + posi })
	// 			}
	// 		}
	// 		onTextChange(value)
	// 		ref?.current?.focus()
	// 	}
	// }
 
 
	return (
		<Layout 
            title="" 
            onLeftPress={navigation.goBack}
            renderLeft={(
                <View style={{ flexDirection:'row', justifyContent:'flex-start', alignItems:'center', gap: 12  }}>
                    <Icon icon="chevron-left" size={24} color="#bbb" />
                    <Text>{title}</Text> 
                </View>
            )}
            renderRight={(
                <View style={{ flexDirection:'row',  alignItems:'center', gap: 12  }}>
                    <Icon icon="share" size={22} color="#feb941"  />
                    {
                        state.focus && (
                            <Text onPress={onNoteSave}>完成</Text>
                        )
                    }
                </View>
               
            )}
        >
			<ScrollView style={{ flex: 1  }} contentContainerStyle={{flex: 1, paddingBottom: 24 }}>
 
				<MarkdownTextInput
					ref={ref}
					multiline
					autoCapitalize="none"
					value={state.value}
					selection={state?.selection}
					onChangeText={onTextChange}
					style={{ 
						alignSelf:'center',
						width: screen?.width - 24,
                        
						fontSize: 20,
						flex: 1,
						padding: 5,
						borderColor: 'gray',
						borderWidth: 0,
						textAlignVertical: 'top',
					}}
					// ref={ref}
					onSelectionChange={e=>{
						ref.selection = e?.nativeEvent?.selection 
					}}
					onFocus={()=>{
                    
						setState({ focus: true })
					}}
					onBlur={(event)=>{
						// ref.current?.focus
                        setState({ focus: false })
					}}
					// markdownStyle={markdownStyle}
					placeholder=""
					// onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
					// selection={selection}
				/> 
			</ScrollView> 
		</Layout>
	);
})

export default Editer