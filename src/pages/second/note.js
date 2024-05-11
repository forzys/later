import {  Text, View} from 'react-native'; 
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import Layout from '@/layout/Layout';
import configs from '@/common/configs';
import { useUpdate } from '../hooks';
import dayjs from 'dayjs';
  
const { screen } = configs
const DEFAULT_TEXT = ['Hello, *world*!', 'https://expensify.com', '# Lorem ipsum', '> Hello world', '`foo`', '```\nbar\n```', '@here', '@someone@swmansion.com', '#room-mention'].join('\n');

export default function App() {
	const [state, setState, { ref, timer }] = useUpdate({
		value: DEFAULT_TEXT,
	})

	const onUpdateLastTime = ()=>{
		ref._last = Date.now();
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
		setState({ value: value }) 
		onUpdateLastTime()
	}
 
 
	return (
		<Layout>
			<View style={{ flex: 1  }}>

				<View style={{ paddingHorizontal: 12, margin: 5  }}>
					<Text>{state?._last}</Text>
				</View>

				<MarkdownTextInput
					ref={ref}
					multiline
					autoCapitalize="none"
					value={state.value}
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
					// markdownStyle={markdownStyle}
					placeholder="Type here..."
					// onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
					// selection={selection}
				/>  
			</View>
		</Layout>
	);
}