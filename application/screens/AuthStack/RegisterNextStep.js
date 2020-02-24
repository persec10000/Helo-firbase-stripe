
import React, { Component } from 'react';
// import { Updates } from 'expo';
import { StyleSheet, Image, TouchableOpacity, View, Text, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Toast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import Global from '@utils/GlobalValue';
import isEmpty from '@utils/isEmpty';
import getPermission from '@utils/getPermission';
import Fire from '@utils/Firebase';
import Strings from '@utils/Strings';

const imageHeight = Math.round(Global.screenWidth * 0.71)

export default class RegisterNextStep extends Component {
	static navigationOptions = {
		header: null
	};
	constructor(props) {
		super(props);

		this.state = {
			avatar: null,
			name: '',
			myuid: '',
			username: '',
			university: '',
			major: '',
			gender: 0, // 1:male, 2:female, 3: prefer not to say
			showGenderContent: false,
			showConfirmEmail: false,
			doneProcessing: false,
			isIphoneX: false,
			locked: false,
		};
	}

	componentWillUnmount() {
		clearInterval(this.clockCall);
		if (this.state.emailVerified) {
			return;
		} else {
			let user = firebase.auth().currentUser;
			if (user !== null) {
				user.delete().then(function () {
					// User deleted.
				}).catch(function (error) {
					// An error happened.
				});
			}
		}
	}
	pressAvatar() {
		this.selectPhoto();
	}
	selectPhoto = async () => {
		const options = {
			allowsEditing: true,
			aspect: [3, 3],
		};
		const status = await getPermission(Permissions.CAMERA_ROLL);
		if (status) {
			const result = await ImagePicker.launchImageLibraryAsync(options);
			if (!result.cancelled) {
				this.setState({ avatar: result.uri });
			}
		}
	};

	pressGender(number) {
		if (number === 0) {
			this.setState({ showGenderContent: !this.state.showGenderContent })
		} else {
			this.setState({ showGenderContent: false, gender: number })
		}
	}

	done() {

		let { avatar, name, username, university, major, gender } = this.state;

		// if (!avatar) {
		// 	Toast.show({ text: Strings.ST12, position: 'bottom', duration: Global.ToastDuration })
		// 	return;
		// }
		name = name.trim().toLowerCase();
		if (isEmpty(name)) {
			Toast.show({ text: Strings.ST13, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		username = username.trim().toLowerCase();
		if (isEmpty(username)) {
			Toast.show({ text: Strings.ST14, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		university = university.trim().toLowerCase();
		if (isEmpty(university)) {
			Toast.show({ text: Strings.ST15, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		major = major.trim().toLowerCase();

		if (gender === 0) {
			Toast.show({ text: Strings.ST16, position: 'bottom', duration: Global.ToastDuration })
			return;
		}
		this.setState({
			doneProcessing: true,
		})

		Fire.shared.checkUsernameDuplicate(username).then((isDuplicate) => {
			if (isDuplicate) {
				Toast.show({ text: Strings.ST17, position: 'bottom', duration: Global.ToastDuration })
				this.setState({
					doneProcessing: false
				})
				return;
			}
			const email = this.props.navigation.state.params.email;
			const password = this.props.navigation.state.params.password;

			firebase.auth().createUserWithEmailAndPassword(email, password).then((res) => {
				if (res.user != null) {
					this.setState({
						myuid: res.user.uid
					})
					res.user.sendEmailVerification().then((result) => {
						Toast.show({ text: Strings.ST18, position: 'bottom', duration: Global.ToastDuration })
						this.setState({
							showConfirmEmail: true
						})
						this.startTimer();
					}).catch((error) => {
						Global.isDev && console.log(error)
						this.setState({
							doneProcessing: false
						})
						Toast.show({ text: Strings.ST19, position: 'bottom', duration: Global.ToastDuration })
					});
				}
			}).catch((e) => {
				if (e.code == 'auth/email-already-in-use') {
					Toast.show({ text: Strings.ST20, position: 'bottom', duration: Global.ToastDuration })
				} else {
					Toast.show({ text: Strings.ST02, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
				}
			})
		}).catch((error) => {
			this.setState({
				doneProcessing: false
			})
			Toast.show({ text: Strings.ST02, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
		})
	}

	startTimer = () => {
		this.clockCall = setInterval(() => {
			const email = this.props.navigation.state.params.email;
			const password = this.props.navigation.state.params.password;
			firebase.auth().signInWithEmailAndPassword(email, password)
				.then((res) => {
					if (res.user != null && res.user.emailVerified) {
						if (this.state.locked) return;
						this.setState({ locked: true });
						clearInterval(this.clockCall);
						Toast.show({ text: Strings.ST21, position: 'bottom', duration: Global.ToastDuration });

						let { avatar, name, username, university, major, gender } = this.state;
						name = name.trim().toLowerCase();
						username = username.trim().toLowerCase();
						university = university.trim().toLowerCase();
						major = major.trim().toLowerCase();

						const userObj = {
							uid: res.user.uid,
							avatar: avatar || '',
							name: name,
							username: username,
							university: university,
							major: major,
							gender: gender,
							email: email,
						}
						Fire.shared.setSignup(userObj).then(() => {
							Toast.show({ text: Strings.ST22, position: 'bottom', duration: Global.ToastDuration });
							this.setState({
								showConfirmEmail: false,
							})
							// setTimeout(() => {
							// 	Updates.reload();
							// }, 1500);
						})
					}
				}).catch((err) => Global.isDev && console.log(err))
		}, 5000);
	}


	renderConfirmEmail() {
		return (
			<View style={styles.emailconfirm_container}>
				<View style={styles.emailconfirm_toptext_wrapper}>
					<Text style={styles.text_black22}>we've sent you a</Text>
					<Text style={styles.text_black22}>confirmation email!</Text>
				</View>

				<View style={styles.f04}></View>

				<View style={styles.emailconfirm_backimage_wrapper}>
					<Image
						source={require('@images/back_confirmemail.png')}
						style={styles.emailconfirm_backimage}
						resizeMode='contain' />
				</View>

				<View style={styles.emailconfirm_bottomtext_wrapper}>
					<Text style={styles.text_black17}>click the link in your</Text>
					<Text style={styles.text_black17}>email to access</Text>
					<Text style={styles.text_black17}>your account</Text>
				</View>
			</View>
		)
	}

	getIsIphoneX(event) {
		const { y } = event.nativeEvent.layout;
		if (y > 40) this.setState({
			isIphoneX: true,
		})
	}

	render() {

		if (this.state.showConfirmEmail) {
			return this.renderConfirmEmail()
		}

		const avatar = this.state.avatar ? { uri: this.state.avatar } : require('@images/camera.png');

		const genderTitle = this.state.gender === 0 ? 'gender  ' : (this.state.gender === 1 ? 'male   ' : (this.state.gender === 2 ? 'female  ' : 'prefer not to say '));

		const avatarwidth = this.state.avatar ? '100%' : '40%';
		const borderradius = this.state.avatar ? Math.round(Global.screenWidth * 0.12) : 0;

		return (

			<SafeAreaView style={styles.topcontainer}>
				<KeyboardAwareScrollView onLayout={(event) => this.getIsIphoneX(event)} scrollEnabled={false}>
					<View style={styles.container}>

						{/* header title */}
						<View transparent style={styles.headercontainer}>

							<View style={styles.headerarrowwrapper}>
								<TouchableOpacity
									onPress={() => this.props.navigation.goBack()}
									style={styles.arrow_wrapper}>
									<Ionicons name="ios-arrow-back" size={25} color={'black'} />
								</TouchableOpacity>
							</View>

							<View style={styles.headerwrapper}>
								<Text style={Global.Header}>step 2</Text>
							</View>
							<View style={{ flex: 1 }} />
						</View>


						<View style={styles.mainareacontainer}>

							{/* avatar 0.18 */}
							<View style={styles.avatarareacontainer}>
								<View style={styles.avatarsubwrapper}>

									<TouchableOpacity onPress={this.pressAvatar.bind(this)} style={styles.avatarwrapper}>
										<Image source={avatar} style={{ width: avatarwidth, height: avatarwidth, borderRadius: borderradius }} resizeMode='contain' />
									</TouchableOpacity>
								</View>

								<View style={styles.addprofilewrapper}>
									<Text style={styles.addprofiletext}>add profile</Text>
									<Text style={styles.addprofiletext}>picture</Text>
								</View>
							</View>


							{/* name username university major */}
							<View style={styles.itemwrapper}>
								<TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.iteminput} placeholder="name" placeholderTextColor='black' onChangeText={text => this.setState({ name: text })}
								/>
							</View>

							<View style={styles.itemwrapper}>
								<TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.iteminput} placeholder="username" placeholderTextColor='black' onChangeText={text => this.setState({ username: text })}
								/>
							</View>

							<View style={styles.itemwrapper}>
								<TextInput maxLength={Global.TM50} autoCapitalize='none' multiline={false} style={styles.iteminput} placeholder="university" placeholderTextColor='black' onChangeText={text => this.setState({ university: text })}
								/>
							</View>

							<View style={styles.itemwrapper}>
								<TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.iteminput} placeholder="major (optional)" placeholderTextColor='black' onChangeText={text => this.setState({ major: text })}
								/>
							</View>



							<View style={{ flex: 0.05 }}></View>

							{/* gender 0.15 */}
							<View style={styles.gendercontainer}>

								<TouchableOpacity style={styles.gendertitle_wrapper} onPress={this.pressGender.bind(this, 0)}>
									<Text style={styles.gendertitle_text}>{genderTitle}</Text>
									<Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
								</TouchableOpacity>

								{this.state.showGenderContent &&
									<TouchableOpacity style={styles.genderitem_wrapper} onPress={this.pressGender.bind(this, 1)}>
										<Text style={styles.genderitemtext}>male</Text>
									</TouchableOpacity>
								}
								{this.state.showGenderContent &&
									<TouchableOpacity style={styles.genderitem_wrapper} onPress={this.pressGender.bind(this, 2)}>
										<Text style={styles.genderitemtext}>female</Text>
									</TouchableOpacity>
								}
								{this.state.showGenderContent &&
									<TouchableOpacity style={styles.genderitem_wrapper} onPress={this.pressGender.bind(this, 3)}>
										<Text style={styles.genderitemtext}>prefer not to say</Text>
									</TouchableOpacity>
								}
							</View>

							<View style={styles.f05}></View>


							{/* done */}
							<View style={styles.bottombtn_container}>
								{!this.state.doneProcessing &&
									<TouchableOpacity style={{ position: 'absolute', bottom: this.state.isIphoneX ? Global.TabBarHeight + 34 : Global.TabBarHeight }} onPress={this.done.bind(this)} >
										<Text style={styles.donetext}>done</Text>
									</TouchableOpacity>
								}
								{this.state.doneProcessing &&
									<ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
								}
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
		alignItems: 'center',
		width: '100%',
		height: Global.screenHeight,
		backgroundColor: Global.colorGreen
	},
	headercontainer: {
		borderBottomWidth: 0,
		flexDirection: 'row',
		height: Math.round(Global.screenWidth * 0.2)
	},
	headerwrapper: {
		flex: 4,
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingBottom: '10%'
	},
	headerarrowwrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	mainareacontainer: {
		flex: 1,
		width: '100%',
		height: '100%',
		alignItems: 'center'
	},
	avatarwrapper: {
		justifyContent: 'center',
		alignItems: 'center',
		width: Math.round(Global.screenWidth * 0.24),
		height: Math.round(Global.screenWidth * 0.24),
		borderRadius: Global.screenWidth * 0.12,
		backgroundColor: Global.colorSignupCameraBack
	},
	avatarareacontainer: {
		flex: 0.18,
		flexDirection: 'row',
		width: '80%'
	},
	addprofilewrapper: {
		flex: 0.7,
		paddingLeft: 20,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start'
	},
	addprofiletext: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 16
	},
	itemwrapper: {
		width: '80%',
		flex: 0.10,
		justifyContent: 'flex-end',
		borderBottomColor: 'black',
		borderBottomWidth: 1
	},
	iteminput: {
		width: '100%',
		fontSize: 18,
		fontFamily: Global.Nimbus_Bold,
		fontWeight: 'normal'
	},
	gendercontainer: {
		flex: 0.19,
		width: '80%',
		alignItems: 'flex-start',
		flexDirection: 'column',
		justifyContent: 'flex-start'
	},
	gendertitle_wrapper: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	gendertitle_text: {
		color: 'black',
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18
	},
	genderitem_wrapper: {
		marginLeft: 50,
		marginTop: 5,
	},
	genderitemtext: {
		color: 'black',
		fontFamily: Global.Nimbus_Regular,
		fontSize: 17
	},
	donetext: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18
	},
	arrow_wrapper: {
		width: '70%',
		height: '60%',
		justifyContent: 'center',
		alignItems: 'center'
	},

	text_black17: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 17
	},
	text_black22: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 22
	},
	emailconfirm_container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: Global.colorGreen,
		flexDirection: 'column'
	},
	emailconfirm_toptext_wrapper: {
		flex: 0.24,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	emailconfirm_backimage_wrapper: {
		flex: 0.42,
		width: '100%',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	emailconfirm_backimage: {
		width: '90%',
		height: imageHeight
	},
	emailconfirm_bottomtext_wrapper: {
		flex: 0.3,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	bottombtn_container: {
		flex: 0.13,
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	f05: {
		flex: 0.05
	},
	avatarsubwrapper: {
		flex: 0.3,
		justifyContent: 'center'
	},
	topcontainer: {
		flex: 1, 
		backgroundColor: Global.colorGreen
	},
	f04: {
		flex: 0.04
	}
});