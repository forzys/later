import { Button, ScrollView, View} from 'react-native'; 
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'

import Bounceable from '@/common/components/Bounceable'
import {ActionButton} from '@/components/Button'
import {ButtonCard} from '@/components/Card'
import Layout from '@/layout/Layout';
import configs from '@/common/configs';
import Snakbar from '@/components/Snakbar';
import Fab from '@/components/Fab';
import { useUpdate } from '../hooks';
import dayjs from 'dayjs';
  
const { screen } = configs
const DEFAULT_TEXT = ['Hello, *world*!', 'https://expensify.com', '# Lorem ipsum', '> Hello world', '`foo`', '```\nbar\n```', '@here', '@someone@swmansion.com', '#room-mention'].join('\n');


export default function App() {
	const [state, setState, { ref, timer }] = useUpdate({
		value: DEFAULT_TEXT,
	})

	const onUpdateLastTime = ()=>{
		ref._last = Date.now() 
		if(ref.timer){
			clearTimeout(ref.timer) 
		}
		ref.timer = setTimeout(()=>{ 
			setState({
				_last: dayjs(ref._last).format('YYYY-MM-DD hh:mm:ss') 
			}) 
		}, 1000) 
	}
	
	const onTextChange = (value)=>{ 
		setState({ value: value, selection:null }) 
		onUpdateLastTime()
	}
 

	const addTag = (tag, posi)=>{
		return (event)=>{
			event.preventDefault();
			const { start,  end } = ref?.selection || {}
			let value = state.value
			if(start === end){
				value = value?.slice(0, end) + tag + value?.slice(end)
				if(!!posi){
					setState({ selection: end + tag.length + posi })
				}
			}
			onTextChange(value)
			ref?.current?.focus()
		}
	}
 
	return (
		<Layout>
			<ScrollView style={{ flex: 1  }}>

				<View style={{ paddingHorizontal: 12, margin: 5  }}>
					<Text>{state?._last}</Text>
				</View>

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
						setState({ visible: true })
					}}
					onBlur={(event)=>{
						// ref.current?.focus
						return 
					}}
					// markdownStyle={markdownStyle}
					placeholder="Type here..."
					// onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
					// selection={selection}
				/>
				
				
			</ScrollView>

			<Fab
				buttonColor="red" 
				iconTextColor="#FFFFFF" 
				onClickAction={() => setState({ visible: true })} 
				visible={!state.visible} 
				iconTextComponent={<Icon icon="plus" color="#FFF" size={16 * 2} />} 
			/>

			<Snakbar
				visible={state.visible}
				containerStyle={{ flex: 1, height: 48,   }}
				onBoxPress={(event)=>event.preventDefault()}
				message={()=>{
					return (
						<View style={{ flex: 1, flexDirection:'row' }}>
							<ScrollView horizontal contentContainerStyle={{ gap: 12, paddingVertical:8, paddingHorizontal:12}}>
								<ButtonCard text="# 标题" style={{padding: 6}} onPress={addTag('# ')} /> 
								<ButtonCard text="- 列表" style={{padding: 6}} onPress={addTag('- ')} />
								<ButtonCard text="* 粗体" style={{padding: 6}} onPress={addTag('**', -1)} />
								<ButtonCard text="> 引用" style={{padding: 6}} onPress={addTag('> ')} />
								<ButtonCard text="~ 删除" style={{padding: 6}} onPress={addTag('~~', -1)} />
							  
							</ScrollView>
						</View>
					)
				}}
				actionHandler={()=>{console.log("snackbar button clicked!")}} 
				action={()=>{
					return ( 
						<Bounceable style={{ width: 48, alignItems:'center', justifyContent:'center'}} onPress={()=>setState({ visible: false })}>
							<Icon 
								name="close" 
								color="#FFF"
								size={16 * 2}
							/>
						</Bounceable> 
					)
				}}
			/>
		</Layout>
	);
}