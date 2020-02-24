
import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import AppHeaderArrow from '@components/AppHeaderArrow';

const imageHeight = Math.round(Global.screenWidth * 0.65)

export default class MyAccount extends Component {
	static navigationOptions = {
		header: null
	};
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			earned: 0,
		};
	}

	componentDidMount() {
		Fire.shared.getMyEarned().then((res) => {
			this.setState({
				earned: parseFloat(res).toFixed(2),
				loading: false,
			})
		}).catch((error) => Global.isDev && console.log(error))
	}

	pressPurchasesOrSales(isClickPurchases) {
		const navigateAction = NavigationActions.navigate({
			routeName: 'MyPurchasesAndSales',
			params: {
				isPurchases: isClickPurchases,
			}
		});
		this.props.navigation.dispatch(navigateAction);
	}

	render() {

		return (
			<View style={styles.container}>

				<AppHeaderArrow title={'my account'} pressArrow={() => this.props.navigation.goBack()} />

				<View style={styles.main_container}>

					{/* earned */}
					<View style={styles.item_wrapper}>
						<Text style={styles.text_black16}>earned</Text>
						{this.state.loading ?
							<ActivityIndicator style={styles.indicator} size="large" color="#f39c12" />
							:
							<Text style={styles.text_black16}>$ {this.state.earned}</Text>
						}
					</View>

					<View style={styles.line}></View>

					<View style={styles.item_wrapper}>
						<Text style={styles.text_black16}>purchases</Text>
						<TouchableOpacity onPress={this.pressPurchasesOrSales.bind(this, true)} style={{ paddingRight: 15 }}>
							<FontAwesome name={'long-arrow-right'} size={18} color={'black'} />
						</TouchableOpacity>
					</View>

					<View style={styles.line}></View>

					<View style={styles.item_wrapper}>
						<Text style={styles.text_black16}>sales</Text>
						<TouchableOpacity onPress={this.pressPurchasesOrSales.bind(this, false)} style={{ paddingRight: 15 }}>
							<FontAwesome name={'long-arrow-right'} size={18} color={'black'} />
						</TouchableOpacity>
					</View>

					<View style={styles.line}></View>

					<View style={styles.imagetopspace}></View>

					{/* image */}
					<View style={styles.bkimage_wrapper}>
						<Image
							source={require('@images/back_myaccount.png')}
							style={styles.bkimage}
							resizeMode='contain' />
					</View>

					<View style={styles.imagebottomspace}></View>
				</View>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Global.colorGreen,
		alignItems: "center"
	},
	main_container: {
		flex: 1,
		width: "100%",
		height: "100%",
		marginBottom: Global.TabBarHeight,
		flexDirection: "column",
		alignItems: "center"
	},
	item_wrapper: {
		flex: 0.09,
		width: "75%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	text_black16: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 16
	},
	line: {
		height: 1,
		width: "100%",
		backgroundColor: "black"
	},
	bkimage_wrapper: {
		flex: 0.47,
		width: "100%",
		justifyContent: "flex-end",
		alignItems: "center"
	},
	bkimage: {
		width: "90%",
		height: imageHeight
	},
	indicator: {
		width: 20,
		height: 20
	},
	imagetopspace: {
		flex: 0.1
	},
	imagebottomspace: {
		flex: 0.16
	}
});