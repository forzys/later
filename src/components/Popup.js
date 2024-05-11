import { Component } from 'react'
import { View,TouchableOpacity, StyleSheet, Animated,  } from 'react-native'
import Icon from '@/common/components/Icon';
import Text from '@/common/components/Text'; 
import configs from '@/common/configs';

const { width, height } = configs.screen

class Popup extends Component {
	static popupInstance

	static show({ ...config }) {
		this.popupInstance.start(config)
	}

	static hide() {
		this.popupInstance.hidePopup()
	}

	state = {
		positionView: new Animated.Value(height),
		opacity: new Animated.Value(0),
		positionPopup: new Animated.Value(height),
		popupHeight: 0
	}

	start({ ...config }) { 
		this.setState({
            btnRender: config.btnRender,
			title: config.title,
			type: config.type,
			icon: config.icon !== undefined ? config.icon : false,
			textBody: config.textBody,
			button: config.button !== undefined ? config.button : true,
			buttonText: config.buttonText || 'Ok',
			callback: config.callback !== undefined ? config.callback : this.defaultCallback(),
			background: config.background || 'rgba(0, 0, 0, 0.5)',
			timing: config.timing,
			autoClose: config.autoClose !== undefined ? config.autoClose : false,
			closeable: config.closeable !== undefined ? config.closeable: false,
			onClose: config.onClose,
		})

		Animated.sequence([
			Animated.timing(this.state.positionView, {
				toValue: 0,
				duration: 100,
				useNativeDriver: false
			}),
			Animated.timing(this.state.opacity, {
				toValue: 1,
				duration: 300,
				useNativeDriver: false
			}),
			Animated.spring(this.state.positionPopup, {
				toValue: (height / (config.topRatio || 2)) - (this.state.popupHeight / 2),
				bounciness: 15,
				useNativeDriver: true
			})
		]).start(config.onLoad)

		if (config.autoClose && config.timing !== 0) {
			const duration = config.timing > 0 ? config.timing : 5000
			setTimeout(() => {
				this.hidePopup()
			}, duration)
		}
	}

	hidePopup() {
		Animated.sequence([
			Animated.timing(this.state.positionPopup, {
				toValue: height,
				duration: 250,
				useNativeDriver: true
			}),
			Animated.timing(this.state.opacity, {
				toValue: 0,
				duration: 300,
				useNativeDriver: false
			}),
			Animated.timing(this.state.positionView, {
				toValue: height,
				duration: 100,
				useNativeDriver: false
			})
		]).start(this.state.onClose)
	}

	defaultCallback() {
		return this.hidePopup(); 
	}

	// handleImage(type) {
	// 	switch (type) {
	// 		case 'Success': return require('../assets/Success.png')
	// 		case 'Danger': return require('../assets/Error.png')
	// 		case 'Warning': return require('../assets/Warning.png') 
	// 	}
	// 	return require('../assets/Warning.png')
	// }

	render() {
		const { title, type, textBody, button, buttonText, callback, background } = this.state
		let el = null;
		if (this.state.button) {
			el = <TouchableOpacity style={[styles.Button, styles[type]]} onPress={callback}>
				<Text style={styles.TextButton}>{buttonText}</Text>
			</TouchableOpacity>
		}else if(this.state.btnRender){
            el = this.state.btnRender(callback)
        } else {
			el = <Text></Text>
		}
		return (
			<Animated.View
				ref={c => this._root = c}
				style={[styles.Container, {
					backgroundColor: background || 'transparent',
					opacity: this.state.opacity,
					transform: [{ translateY: this.state.positionView }]
				}]}
			>
				<Animated.View
					onLayout={event => { this.setState({ popupHeight: event.nativeEvent.layout.height }) }}
					style={[styles.Message, { transform: [{ translateY: this.state.positionPopup }] }]}
				>
					<View style={styles.Header} />
					{
						this.state.icon ? (this.state.icon) : null
							// <Image
							// 	source={this.handleImage(type)}
							// 	resizeMode="contain"
							// 	style={styles.Image}
							// />
					}
					{
						this.state.closeable ? (
							<TouchableOpacity style={styles.Close} onPress={callback}>
								<Icon source="close-bold" size={18} />
							</TouchableOpacity> 
						): null
					}
					<View style={styles.Content}>
						<Text style={styles.Title}>{title}</Text>
						<Text style={styles.Desc}>{textBody}</Text>
						{el}
					</View>
				</Animated.View>
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	Container: {
		position: 'absolute',
		zIndex: 99999,
		width: width,
		height: height,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		top: 0,
		left: 0
	},
	Message: {
		maxWidth: width - 24,
		width:  width - 24,
		minHeight: 250,
		backgroundColor: '#fff',
		borderRadius: 30,
		alignItems: 'center',
		overflow: 'hidden',
		position: 'absolute',
	},
	Content: {
		padding: 20,
		alignItems: 'center'
	},
	Header: {
		height: 200,
		width: 230,
		backgroundColor: '#FBFBFB',
		borderRadius: 100,
		marginTop: -120
	},
	Image: {
		width: 150,
		height: 80,
		position: 'absolute',
		top: 20
	},
	Close:{
		width:20,
		height:20,
		position:'absolute',
		right: 12,
		top:12,
	},
	Title: {
		fontWeight: 'bold',
		fontSize: 18,
		color: '#333'
	},
	Desc: {
		textAlign: 'center',
		color: '#666',
		marginTop: 10
	},
	Button: {
		borderRadius: 50,
		height: 40,
		width: 130,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 30
	},
	TextButton: {
		color: '#fff',
		fontWeight: 'bold'
	},
	Success: {
		backgroundColor: '#AAF577',
		shadowColor: "#AAF577",
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.36,
		shadowRadius: 6.68,
		elevation: 11
	},
	Danger: {
		backgroundColor: '#F29091',
		shadowColor: "#F29091",
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.36,
		shadowRadius: 6.68,
		elevation: 11
	},
	Warning: {
		backgroundColor: '#fbd10d',
		shadowColor: "#fbd10d",
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.36,
		shadowRadius: 6.68,
		elevation: 11
	}
})

export default Popup
