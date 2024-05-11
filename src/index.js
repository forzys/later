import { memo, useEffect, useRef } from "react";
import { View, Text, Linking, AppState } from "react-native";
import { NavigationContainer,  } from '@react-navigation/native'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createStackNavigator } from '@react-navigation/native-stack'; 
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';
// import { BottomFabBar } from 'rn-wave-bottom-bar';
import Icon from '@/common/components/Icon';
import configs from '@/common/configs';
// import { AutoEvent } from '@/common/event'
import { useReceive } from '@/hooks'
import HomeScreen from "./pages/home";
import ReceiveScreen from "./pages/receive";
import ExpandScreen from "./pages/expand";
import SocialScreen from "./pages/social";
import NotesScreen from "./pages/notes";
import ModalScreen from "./pages/modal";
import CollectionScreen from "./pages/collection";

import FontsScreen from "./pages/expands/fonts";
import DouyinScreen from "./pages/expands/douyin";
import { useFontFace } from "./hooks";

const { isAndroid } = configs?.devices

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const _color = '#000'

const TabBar = (props)=>(
    <BottomFabBar
        mode={enableSquare ? 'square' : 'default'}
        focusedButtonStyle={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.61,
            shadowRadius: 8,
            elevation: 14,
        }}
        bottomBarContainerStyle={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        }}
        springConfig={{
            stiffness: 1500,
            damping: 85,
            mass: 4,
        }}
        {...props}
    />
)

const RoutersHoc = (routers)=>{
    const tabBarIcon = (name) => ({ focused, color, size }) => <Icon icon={name} size={22} color={color} />;
    return memo((props)=>{
		const { fontName = 'Roboto' } = useFontFace();
 
        return (
            <Tab.Navigator
                screenOptions={{
					tabBarHideOnKeyboard: true,
                    tabBarActiveTintColor: _color,
                    tabBarInactiveTintColor: _color,
                    tabBarActiveBackgroundColor: 'white',
                    tabBarInactiveBackgroundColor: '#FFF',
                    tabBarLabelStyle: { color: _color, fontSize: 12  },
                }}
                // tabBar={TabBar}
            >
                {
					routers?.map((item, index)=>(
						<Tab.Screen
							key={item.name}
							name={item.name}
							title={item?.title}
							component={item.component}
                            options={{
                                tabBarIcon: tabBarIcon(item.icon),
                                tabBarLabel: item.title,
								tabBarLabelStyle:{
									fontFamily: fontName,
								},
								headerShown: false,
                                // tabBarLabelStyle: { color: '#5BBCFF', fontSize: 12 },
                                // tabBarActiveTintColor: '#59E0A7',
		                        // tabBarInactiveTintColor: '#5E5E5E',
                            }}
							// options={onFormatOption(task && item.name === 'Task' ? {...item, badge: task } : item)}
						/>
					))
				} 
            </Tab.Navigator>
        )
    })
}

// 屏幕路由
const routers = [
	{
		// icon: 'home-outline' ,
		icon: 'coffee-alt',
		selectedColor: '#325BFA', 
		name: 'Home',
		title: '稍候',
		component: HomeScreen,
	},
	{
		// icon: 'clipboard-check-outline' ,
		icon: 'server',
		selectedColor: '#325BFA', 
		name: 'Collection',
		title: '抽屉', 
        component: CollectionScreen,
	},
	{
		icon: 'shape-square',
		selectedColor: '#325BFA', 
		name: 'Social',
		title: '广场',
        component: SocialScreen,
	},
	{ 
		icon: 'extension',
		selectedColor: '#325BFA', 
		name: 'Expand',
		title: '拓展',
        component: ExpandScreen,
	},
	{ 
		icon: 'user',
		selectedColor: '#325BFA', 
		name: 'Me',
		title: '我的',
        component:  ReceiveScreen,
	},
]
 
// 二级页面路由
const childrenRouter = [
	// { name: 'Fonts', component: FontsScreen }, 
	{ name: 'Notes', component: NotesScreen }, 
	{ name: 'Fonts', component: FontsScreen }, 
	{ name: 'Douyin', component: DouyinScreen }, 
	// { name: 'Setting', component: SettingScreen },
	// { name: 'Detail', component: DetailScreen },
	// { name: 'Search', component: SearchScreen },
	// { name: 'Verify', component: VerifyScreen }, 
	// { name: 'Bill', component: BillScreen }, 
	// { name: 'Results', component: ResultsScreen }, 
	// { name: 'Activity', component: ActivityScreen }, 
	// { name: 'Orders', component: OrderScreen }, 
	// { name: 'Form', component: FormScreen },
	// { name: 'Social', component: SocialScreen },
	// { name: 'Bank', component: BankScreen }, 
	// { name: 'RePost', component: RePostScreen }, 
	// { name: 'Chats', component: ChatsScreen }, 
]


export default memo((props)=>{
	const navigationRef = useRef();
	const { isShareing } = useReceive()

	useEffect(()=>{
		if(isShareing){
			console.log('------进入 Shareing')
			navigationRef.current.navigate('Receive')
		}
	},[isShareing])


	useEffect(()=>{
		console.log('---=== 页面全局初始化 ->')
		// URL:   
		const schemes = ({ url })=>{
            console.log( URL(url) )
		}
		
		const appState = (status)=>{
			if(status === 'active'){
				console.log('App has come to the foreground!');
                // AutoEvent()
			}
			if(status === 'background'){
				console.log('App has come to the background!');
			}
		} 
		// 初始化启动时意图判断
		Linking.getInitialURL().then(url => void (url && schemes({ url })));
 
		const appstater = AppState.addEventListener('change', appState);
		const schemeser = Linking.addEventListener('url', schemes);

		return () => {
			// app State remove
			appstater.remove();
			// deep link remove
			schemeser.remove()
			// Linking.removeAllListeners()
		};
	},[]);

    
    return (
        <NavigationContainer ref={c => { if(c) configs.navigation = c }}>
            <Stack.Navigator 
				initialRouteName='Pages'
				// screenOptions={{
				// 	gestureEnabled: true,
				// 	...(isAndroid && TransitionPresets.ModalPresentationIOS),
				// }}
			>
                <Stack.Screen name="Pages" component={RoutersHoc(routers)} options={{ headerShown: false }} />
                <Stack.Screen 
					name="Receive" 
					component={ReceiveScreen} 
					options={{ 
						gestureEnabled: true,
						...(isAndroid && TransitionPresets.ModalPresentationIOS),
						presentation: 'modal', headerShown: false  
					}} 
				/>
                <Stack.Screen 
					name="Modal"
					component={ModalScreen} 
					options={{ 
						gestureEnabled: true,
						...(isAndroid && TransitionPresets.ModalPresentationIOS),
						presentation: 'modal', headerShown: false  
					}} 
				/>

                <Stack.Group>
                    {
                        childrenRouter?.map(item=>(
                            <Stack.Screen 
								key={item.name} 
								name={item.name} 
								component={item.component}
								options={{ headerShown: false }} 
							/> 
                        ))
                    }
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    )
})