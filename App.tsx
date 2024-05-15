import 'react-native-gesture-handler';
import { memo } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PopupProvider from './src/provider/popup'
import { RootSiblingParent } from './src/provider/rooter';
import FontFaceProvider from './src/provider/fontface'
import ErrorBoundary from './src/provider/boundary'
import AuthProvider from './src/provider/auth'
import ServerProvider from './src/provider/server'
import ReceiveProvider from './src/provider/receive'
// import ModalProvider from './src/provider/modal'
// import MenuProvider from './src/provider/menu'



import App from './src'


export default memo(()=>(  
	<SafeAreaProvider>
		<FontFaceProvider> 
			<PopupProvider>
				<RootSiblingParent> 
					<ErrorBoundary> 
						<AuthProvider>
							<ServerProvider>
								<ReceiveProvider>
									<App />
								</ReceiveProvider>
							</ServerProvider>
						</AuthProvider>
					</ErrorBoundary> 
				</RootSiblingParent> 
			</PopupProvider> 
		</FontFaceProvider>
		
	{/* <ModalProvider> 
			<AuthProvider> 
				<Source />
			</AuthProvider>
		</ModalProvider>   */}
	</SafeAreaProvider>
))