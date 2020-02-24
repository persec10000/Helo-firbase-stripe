
import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet, SafeAreaView } from 'react-native';
import Global from '@utils/GlobalValue';

const imageHeight = Math.round(Global.screenWidth * 0.65)

export default class Start extends Component {
	static navigationOptions = {
		header: null
	};

	render() {
		return (

			<SafeAreaView style={styles.container}>

				<View style={styles.containerlogo}>
					<Image
						source={require('@images/logo.png')}
						style={styles.imagelogo} resizeMode='contain' />
				</View>

				<View style={styles.containerheelo}>
					<Text style={styles.textheelo}>(hee-lo)</Text>
				</View>

				<View style={styles.containerforeveryone}>
					<Text style={styles.textforeveryone}>campus marketplace</Text>
				</View>

				<View style={styles.containerimage}>
					<Image source={require('@images/back_landing.png')}
						style={styles.backimage} resizeMode='contain' />
				</View>

				<View style={styles.f09}></View>

				<View style={styles.containerbutton}>
					<TouchableOpacity
						style={styles.buttonsignupwrapper}
						onPress={() => this.props.navigation.navigate('Register')} >
						<Text style={styles.signuptext}>sign up</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.f01}></View>

				<View style={styles.containerbutton}>
					<TouchableOpacity style={[styles.buttonsignupwrapper, { backgroundColor: Global.colorPink }]}
						onPress={() => this.props.navigation.navigate('LoginScreen')} >
						<Text style={styles.logintext}>log in</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.f04}></View>

			</SafeAreaView>

		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		flexDirection: "column",
		height: "100%",
		alignItems: "center",
		backgroundColor: Global.colorPink
	},
	containerlogo: {
		flex: 0.15,
		width: "100%",
		alignItems: "center",
		justifyContent: "flex-end"
	},
	imagelogo: {
		width: Math.round(Global.screenWidth * 0.5),
		height: Math.round(Global.screenHeight * 0.15 * 0.9),
		paddingBottom: "25%"
	},
	containerimage: {
		flex: 0.36,
		width: "100%",
		alignItems: "center",
		justifyContent: "flex-end"
	},
	textheelo: {
		fontFamily: Global.Nimbus_Regular,
		fontSize: 15
	},
	containerheelo: {
		flex: 0.04,
		justifyContent: "flex-start",
		alignItems: "center"
	},
	textforeveryone: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 14
	},
	containerforeveryone: {
		flex: 0.15,
		justifyContent: "center",
		alignItems: "center"
	},
	containerbutton: {
		flex: 0.08,
		width: "75%"
	},
	buttonsignupwrapper: {
		width: "100%",
		height: "100%",
		backgroundColor: Global.colorButtonBlue,
		justifyContent: "center",
		alignItems: "center"
	},
	signuptext: {
		fontFamily: Global.Nimbus_Bold,
		color: "white",
		fontSize: 27,
		lineHeight: Math.round(Global.screenHeight * 0.08)
	},
	logintext: {
		fontFamily: Global.Nimbus_Bold,
		color: "black",
		fontSize: 22
	},
	f09: {
		flex: 0.09
	},
	f01: {
		flex: 0.01
	},
	f04: {
		flex: 0.04
	},
	backimage: {
		width: "90%",
		height: imageHeight
	}
});