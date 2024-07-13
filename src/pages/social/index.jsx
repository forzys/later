import { Button, ScrollView, View} from 'react-native'; 
// import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import Text from '@/common/components/Text'
import Icon from '@/common/components/Icon'

import Bounceable from '@/common/components/Bounceable'
import {ActionButton} from '@/components/Button'
import {ButtonCard} from '@/components/Card'
import Layout from '@/layout/Layout';
import configs from '@/common/configs';
import Snakbar from '@/components/Snakbar';
import Fab from '@/components/Fab';
import { useUpdate } from '@/hooks';
import dayjs from 'dayjs';
  
const { screen } = configs
 
export default function App() {
	const [state, setState, { ref, timer }] = useUpdate({ })
 
	 
	return (
		<Layout style={{ padding: 12 }}>
			 <View>
                <Text>社交</Text>
             </View>
		</Layout>
	);
}