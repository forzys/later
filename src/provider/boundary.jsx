import React, { Component } from 'react' 
import { StyleSheet, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
 
const FallbackComponent = (props) => (
	<SafeAreaView style={styles.container}>
		<View style={styles.content}>
			<Text style={styles.title}>Oops!</Text>
			<Text style={styles.subtitle}>{"There's an error"}</Text>
			<Text style={styles.error}>{props.error.toString()}</Text>
			<TouchableOpacity style={styles.button} onPress={props.resetError}>
				<Text style={styles.buttonText}>Try again</Text>
			</TouchableOpacity>
		</View>
	</SafeAreaView>
)

class ErrorBoundary extends Component {
	state = { error: null }
	static defaultProps  = {
		FallbackComponent: FallbackComponent,
	}

	static getDerivedStateFromError(error) { 
		return { error }
	}

	componentDidCatch(error, info ) {
		if (typeof this.props.onError === 'function') {
			this.props.onError(error, info.componentStack)
		}
	}

	resetError = () => {
		this.setState({ error: null })
	}

	render() {
		const { FallbackComponent } = this.props 
		return this.state.error ? (
			<FallbackComponent
				error={this.state.error}
				resetError={this.resetError}
			/>
		) : this.props.children
	}
}

export default ErrorBoundary


const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fafafa',
		flex: 1,
		justifyContent: 'center',
	},
	content: {
		marginHorizontal: 16,
	},
	title: {
		fontSize: 48,
		fontWeight: '300',
		paddingBottom: 16,
		color: '#000',
	},
	subtitle: {
		fontSize: 32,
		fontWeight: '800',
		color: '#000',
	},
	error: {
		paddingVertical: 16,
	},
	button: {
		backgroundColor: '#2196f3',
		borderRadius: 50,
		padding: 16,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
		textAlign: 'center',
	},
})