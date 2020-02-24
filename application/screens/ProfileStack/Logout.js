import React, { Component } from 'react';
import * as firebase from 'firebase';
import Fire from '@utils/Firebase';

export default class Logout extends Component {
	componentDidMount() {
		Fire.shared.unSubscribe('signout');
		firebase.auth().signOut().then(() => {
		}).catch(error => {
		})
	}
	render() {
		return null;
	}
}