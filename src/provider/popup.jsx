import React, { Component } from 'react';
import { View } from 'react-native';
import Popup from '@/common/components/Popup';
import Toast from '@/components/Toast';
import Notification from '@/components/Notification';
import Confetti from '@/components/Confetti';
 
export default class PopupProvider extends Component {
	render() {
		return (
			<View ref={c => (this._root = c)} style={{ flex: 1 }} {...this.props}>
				{this.props.children}
				<Popup ref={c => { if (c) Popup.popupInstance = c }} />
				<Toast ref={c => { if (c) Toast.toastInstance = c }} />
				<Notification ref={c => { if (c) Notification.notificationInstance = c }} />
				<Confetti ref={c => { if (c) Confetti.confettiInstance = c }}  />
			</View>
		)
	}
}