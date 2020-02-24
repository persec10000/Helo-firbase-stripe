
import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Text, TextInput, SafeAreaView } from 'react-native';
import { Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Ionicons } from '@expo/vector-icons';
import { NavigationActions } from 'react-navigation';
import Global from '@utils/GlobalValue';
import isEmpty from '@utils/isEmpty';
import Strings from '@utils/Strings';

const imageHeight = Math.round(Global.screenWidth * 0.59)

export default class Register extends Component {
	static navigationOptions = {
		header: null
	};
	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
			isIphoneX: false,
		};
	}

	next() {

		let { email, password } = this.state;
		email = email.trim();

		if (isEmpty(email) || isEmpty(password)) {
			Toast.show({ text: Strings.ST08, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		if (reg.test(email) === false) {
			Toast.show({ text: Strings.ST09, position: 'bottom', duration: Global.ToastDuration })
			return;
		} else {
			// edu email check
			// let arraytemp = email.split(".");
			// if (arraytemp[arraytemp.length-1] !== 'edu') {
			// 	Toast.show({ text: Strings.ST10, position: 'bottom', duration:Global.ToastDuration })
			// 	return;
			// };
		}
		if (password.length < 8) {
			Toast.show({ text: Strings.ST11, position: 'bottom', duration: Global.ToastDuration })
			return;
		}

		const navigateAction = NavigationActions.navigate({
			routeName: 'RegisterNextStepScreen',
			params: {
				email: email,
				password: password
			}
		});
		this.props.navigation.dispatch(navigateAction);
	}

	getIsIphoneX(event) {
		const { y } = event.nativeEvent.layout;
		if (y > 40) this.setState({
			isIphoneX: true,
		})
	}

	render() {
		return (

			<SafeAreaView style={styles.topcontainer}>
				<KeyboardAwareScrollView onLayout={(event) => this.getIsIphoneX(event)} scrollEnabled={false}>
					<View style={styles.container}>

						{/* header title */}
						<View style={styles.headercontainer}>
							<View style={styles.headerwrapper}>

								<TouchableOpacity
									onPress={() => this.props.navigation.goBack()}
									style={styles.arrow}>
									<Ionicons name="ios-arrow-back" size={25} color={'black'} />
								</TouchableOpacity>
							</View>

							<View style={styles.signupwrapper}>
								<Text style={Global.Header}>signup</Text>
							</View>

							<View style={styles.f1} />
						</View>


						<View style={styles.mainareacontainer}>

							<View style={styles.f02}></View>

							<View style={styles.backimage_wrapper}>
								<Image
									source={require('@images/back_signup.png')}
									style={styles.backimage}
									resizeMode='contain' />
							</View>


							<View style={styles.nextareacontainer}>

								<View style={styles.useyourwrapper}>
									<Text style={styles.useyourtext}>use your</Text>
									<Text style={styles.useyourtext}>university email</Text>
									<Text style={styles.useyourtext}>to sign up</Text>
								</View>


								<View style={styles.emailwrapper}>
									<TextInput maxLength={Global.TM30} autoCapitalize='none' autoCorrect={false} multiline={false} style={styles.emailinput} placeholder="email" placeholderTextColor='black' onChangeText={text => {
										this.setState({ email: text });
									}}
									/>
								</View>

								<View style={styles.emailwrapper}>
									<TextInput maxLength={Global.TM30} secureTextEntry autoCapitalize='none' autoCorrect={false} multiline={false} style={styles.emailinput} placeholder="password" placeholderTextColor='black' onChangeText={text => {
										this.setState({ password: text });
									}}
									/>
								</View>

								<View style={styles.characterwrapper}>
									<Text style={styles.charactertext}>8 characters</Text>
								</View>

								<View style={styles.nextwrapper}>
									<TouchableOpacity style={{ position: 'absolute', bottom: this.state.isIphoneX ? Global.TabBarHeight + 20 : Global.TabBarHeight }} onPress={this.next.bind(this)}>
										<Text style={styles.nexttext}>next</Text>
									</TouchableOpacity>
								</View>

							</View>
						</View>
					</View>
				</KeyboardAwareScrollView>

			</SafeAreaView>
		)
	}
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		height: Global.screenHeight,
		flexDirection: "column",
		alignItems: "center",
		backgroundColor: Global.colorGreen
	},
	headercontainer: {
		borderBottomWidth: 0,
		flexDirection: "row",
		height: Global.screenWidth * 0.2
	},
	headerwrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	signupwrapper: {
		flex: 4,
		justifyContent: "flex-end",
		alignItems: "center",
		paddingBottom: "10%"
	},
	mainareacontainer: {
		flex: 1,
		width: "100%",
		height: "100%",
		flexDirection: "column",
		alignItems: "center"
	},
	imagewrapper: {
		flex: 0.38,
		width: "100%"
		// height:'100%'
	},
	nextareacontainer: {
		flex: 0.6,
		flexDirection: "column",
		width: "80%"
	},

	useyourwrapper: {
		flex: 0.36,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column"
	},
	useyourtext: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 18,
		lineHeight: 18
	},

	emailinput: {
		width: "100%",
		fontSize: 18,
		fontFamily: Global.Nimbus_Bold,
		fontWeight: "normal"
	},
	emailwrapper: {
		flex: 0.12,
		width: "100%",
		justifyContent: "flex-end",
		borderBottomColor: "black",
		borderBottomWidth: 1
	},
	charactertext: {
		color: "gray",
		fontFamily: Global.Nimbus_Bold,
		fontSize: 13
	},
	characterwrapper: {
		flex: 0.1,
		justifyContent: "center",
		alignItems: "flex-start"
	},
	nexttext: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18
	},
	nextwrapper: {
		flex: 0.3,
		justifyContent: "flex-end",
		alignItems: "center"
	},
	arrow: {
		width: "70%",
		height: "60%",
		justifyContent: "center",
		alignItems: "center"
	},
	f02: {
		flex: 0.02
	},
	backimage_wrapper: {
		flex: 0.38,
		width: '100%',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	backimage: {
		width: '90%',
		height: imageHeight
	},
	topcontainer: {
		flex: 1,
		backgroundColor: Global.colorGreen
	},
	f1: {
		flex: 1
	}
});