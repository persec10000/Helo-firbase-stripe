import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Text, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { Toast } from 'native-base';
import * as firebase from 'firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import Strings from '@utils/Strings';

const imageHeight = Math.round(Global.screenWidth * 0.7)

export default class Login extends Component {// 'LoginScreen'
	static navigationOptions = {
		header: null
	};
	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
			isIphoneX: false,
			processing_login: false,
		};
		this.getEmail = this.getEmail.bind(this);
	}

	componentWillUnmount() {
		this.setState({
			showemailverification: false
		})
	}

	getEmail = () => {
		const username = this.state.email;
		if (username === '') {
			return '';
		}
		let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		if (reg.test(username)) {
			return username;
		} else {
			return Fire.shared.getEmail(username).then((email) => {
				return email
			}).catch((error) => Global.isDev && console.log(error));
		}
	}

	async pressLogin() {
		let email = this.state.email;
		const password = this.state.password;
		if (email === '') {
			Toast.show({ text: Strings.ST58, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		if (password === '') {
			Toast.show({ text: Strings.ST03, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		this.setState({
			processing_login: true,
		})

		email = await this.getEmail();
		if (email === 'error_notexits') {
			Toast.show({ text: Strings.ST04, position: 'bottom', duration: Global.ToastDuration })
			this.setState({
				processing_login: false,
			})
			return;
		}

		firebase.auth().signInWithEmailAndPassword(email, password).then((res) => {

		}).catch((error) => {
			const errorCode = error.code;
			// const errorMessage = error.message;
			if (errorCode === 'auth/wrong-password') {
				Toast.show({ text: Strings.ST05, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
			} else if (errorCode === 'auth/user-not-found') {
				Toast.show({ text: Strings.ST04, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
			} else if (errorCode === 'auth/user-disabled') {
				Toast.show({ text: Strings.ST24, position: 'bottom', duration: Global.ToastDuration })
			} else {
				Toast.show({ text: Strings.ST02, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
			}
			this.setState({
				processing_login: false,
			})
		});
	}

	forgotpass() {
		const email = this.state.email;
		if (email === '') {
			Toast.show({ text: Strings.ST01, position: 'bottom', duration: Global.ToastDuration })
			return;
		}

		firebase.auth().sendPasswordResetEmail(email).then(() => {
			Toast.show({ text: Strings.ST06, position: 'bottom', duration: Global.ToastDuration });
		}).catch((error) => {
			Global.isDev && console.log(error)
			const errorCode = error.code;
			if (errorCode === 'auth/user-not-found') {
				Toast.show({ text: Strings.ST04, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
			} else if (errorCode === 'auth/user-disabled') {
				Toast.show({ text: Strings.ST24, position: 'bottom', duration: Global.ToastDuration })
			} else if (errorCode === "auth/invalid-email") {
				Toast.show({ text: Strings.ST09, position: 'bottom', duration: Global.ToastDuration })
			} else {
				Toast.show({ text: Strings.ST02, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
			}
		});
	}

	getIsIphoneX(event) {
		const { y } = event.nativeEvent.layout;
		if (y > 40) this.setState({
			isIphoneX: true,
		})
	}

	render() {

		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: Global.colorLoginBack }}>
				<KeyboardAwareScrollView onLayout={(event) => this.getIsIphoneX(event)} scrollEnabled={false}>

					<View style={styles.container}>
						{/* header */}
						<View style={styles.headercontainer}>

							<View style={styles.headerwrapper}>
								<TouchableOpacity
									onPress={() => this.props.navigation.goBack()}
									style={styles.arrow_wrapper}>
									<Ionicons name="ios-arrow-back" size={25} color={'black'} />
								</TouchableOpacity>
							</View>

							<View style={styles.loginwrapper}>
								<Text style={Global.Header}>login</Text>
							</View>

							<View style={{ flex: 1 }} />
						</View>


						<View style={styles.mainareacontainer}>

							<View style={styles.f05}></View>
							{/* image */}
							<View style={styles.imagewrapper}>
								<Image
									source={require('@images/back_login.png')}
									style={styles.bkimage} resizeMode='contain' />
							</View>

							<View style={styles.f05}></View>


							<View style={styles.nextareacontainer}>
								{/* username and password */}
								<View style={styles.usernamewrapper}>
									<TextInput maxLength={Global.TM30} autoCapitalize='none' autoCorrect={false} multiline={false} style={styles.usernameinput} placeholder="username" placeholderTextColor='black' onChangeText={text => this.setState({ email: text })}
									/>
								</View>

								<View style={styles.passwordwrapper}>
									<TextInput maxLength={Global.TM30} secureTextEntry autoCorrect={false} autoCapitalize='none' multiline={false} style={styles.usernameinput} placeholder="password" placeholderTextColor='black' onChangeText={text => this.setState({ password: text })}
									/>
								</View>

								<View style={styles.forgotwrapper}>
									<TouchableOpacity onPress={this.forgotpass.bind(this)}>
										<Text style={styles.forgottext}>i forgot</Text>
									</TouchableOpacity>
								</View>

								{this.state.processing_login ?
									<View style={[styles.login_wrapper, { bottom: this.state.isIphoneX ? Global.TabBarHeight + 30 : Global.TabBarHeight }]}>
										<ActivityIndicator size="large" color="#f39c12" />
									</View>

									:
									<TouchableOpacity style={[styles.login_wrapper, { bottom: this.state.isIphoneX ? Global.TabBarHeight + 30 : Global.TabBarHeight }]} onPress={this.pressLogin.bind(this)}>
										<Text style={styles.bottomlogintext}>login</Text>
									</TouchableOpacity>
								}

							</View>
						</View>

					</View>
				</KeyboardAwareScrollView>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		height: Global.screenHeight,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: Global.colorLoginBack
	},
	headercontainer: {
		borderBottomWidth: 0,
		flexDirection: 'row',
		height: Global.screenWidth * 0.2
	},
	headerwrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	arrow_wrapper: {
		width: '70%',
		height: '60%',
		justifyContent: 'center',
		alignItems: 'center'
	},
	loginwrapper: {
		flex: 4,
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingBottom: '10%'
	},
	mainareacontainer: {
		flex: 1,
		width: '100%',
		height: '100%',
		flexDirection: 'column',
		alignItems: 'center'
	},
	imagewrapper: {
		flex: 0.45,
		width: '100%',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},

	nextareacontainer: {
		flex: 0.45,
		flexDirection: 'column',
		width: '80%'
	},
	usernameinput: {
		width: '100%',
		fontSize: 18,
		fontFamily: Global.Nimbus_Bold,
		fontWeight: 'normal'
	},
	usernamewrapper: {
		flex: 0.15,
		width: '100%',
		justifyContent: 'flex-end',
		borderBottomColor: 'black',
		borderBottomWidth: 1
	},
	passwordwrapper: {
		width: '100%',
		flex: 0.20,
		justifyContent: 'flex-end',
		borderBottomColor: 'black',
		borderBottomWidth: 1
	},
	forgottext: {
		color: 'gray',
		fontFamily: Global.Nimbus_Bold,
		fontSize: 15
	},
	forgotwrapper: {
		flex: 0.15,
		justifyContent: 'center',
		alignItems: 'flex-start'
	},

	bottomlogintext: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18
	},
	containermodal: {
		flex: 1,
		marginTop: 0,
		width: '100%',
		height: Global.screenHeight,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: Global.colorLoginBack
	},
	bottomconfirmwrapper: {
		flex: 0.5,
		width: '100%',
		justifyContent: 'flex-end',
		marginBottom: 20,
		alignItems: 'center'
	},
	bottomconfirmtext: {
		width: '100%',
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18,
		color: '#ffffff',
		textAlign: 'center'
	},
	graytext: {
		color: 'gray',
		fontFamily: Global.Nimbus_Bold,
		fontSize: 15
	},
	activityIndicator: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: 80,
		position: 'relative',
	},
	f05: {
		flex: 0.05
	},
	bkimage: {
		width: '90%', 
		height: imageHeight
	},
	login_wrapper: {
		alignSelf: 'center', 
		position: 'absolute'
	}
});