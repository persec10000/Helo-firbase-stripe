
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import BraintreeDropIn from 'react-native-braintree-dropin-ui';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import DatePicker from 'react-native-datepicker';
import Global from '@utils/GlobalValue';
import { sendPushNotification } from '@utils/GlobalFunction';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import StripeCardInput from "@components/StripeCardInput";
import AppHeaderArrow from '@components/AppHeaderArrow';


const stripe = require('stripe-client')(Global.StripePublicKey);
const imageHeight = Global.screenWidth * 0.3;

export default class Checkout extends Component { //'CheckoutScreen'
	static navigationOptions = {
		header: null
	};

	constructor(props) {
		super(props);
		this.state = {
			date: '',
			time: '',
			location: '',
			discountCode: '',
			everBuy: true,
			showPickedDate: false,
			showPickedTime: false,
			dateBoxMin: '',

			checkoutObjs: [],
			totalPrice: 0,
			sellerusername: '',
			selleruid: '',

			confirmProcessing: false,
			showCardInput: false,
		};
	}

	componentDidMount() {
		// date control minDate setting
		const now = new Date();
		const todayDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
		this.setState({
			dateBoxMin: todayDate // '08/23/2019'
		})

		const { params } = this.props.navigation.state;
		if (params && params.checkoutObjs) {
			let checkoutObjs = params.checkoutObjs;

			// duplicate check
			const lastItemPostid = checkoutObjs[checkoutObjs.length - 1].postid;
			let countSameAsLast = 0;
			for (let i = 0; i < checkoutObjs.length - 1; i++) {
				if (lastItemPostid === checkoutObjs[i].postid) {
					countSameAsLast += 1;
				}
			}
			if (countSameAsLast === 1) {
				checkoutObjs.splice(checkoutObjs.length - 1, 1);
			}

			// totalPrice calc
			let totalPrice = 0;
			for (let i = 0; i < checkoutObjs.length; i++) {
				totalPrice += parseFloat(checkoutObjs[i].price);
			}
			// everbuy check
			Fire.shared.checkEverBuy().then((everBuy) => {
				this.setState({
					checkoutObjs: checkoutObjs,
					totalPrice: totalPrice,
					selleruid: checkoutObjs[0].selleruid || '',
					sellerusername: checkoutObjs[0].sellerusername || '',
					everBuy: everBuy
				})
			}).catch((error) => Global.isDev && console.log(error));
		}
	}

	pressBackArrow = () => {
		this.props.navigation.goBack();
	}

	pressdate() {
		if (this.state.confirmProcessing) return;
		this.datePicker.onPressDate();
	}

	presstime() {
		if (this.state.confirmProcessing) return;
		this.timePicker.onPressDate();
	}

	pressAddmore() {
		if (this.state.confirmProcessing) return;
		const navigateAction = NavigationActions.navigate({
			routeName: 'OtherProfileScreen',
			params: {
				from: 'CheckoutScreen',
				uid: this.state.selleruid,
				checkoutObjs: this.state.checkoutObjs
			}
		});
		this.props.navigation.dispatch(navigateAction);
	}
	pressCardOkCancel(isOk, cardInfo) {
		this.setState({
			showCardInput: false,
		})
		if (isOk) {
			this.nextProcess(cardInfo);
		} else {
			this.setState({ confirmProcessing: false });
		}
	}
	pressConfirm() {
		if (this.state.confirmProcessing) return;
		this.setState({ confirmProcessing: true });
		console.log(BraintreeDropIn)
		BraintreeDropIn.show({
			clientToken: "sandbox_tvk9c636_xyq6zs4qjb2666cd",
			merchantIdentifier: 'xyq6zs4qjb2666cd',
			googlePayMerchantId: '1953896702662410263',
			countryCode: 'US',    //apple pay setting
			currencyCode: 'USD',   //apple pay setting
			merchantName: 'Your Merchant Name for Apple Pay',
			orderTotal:'Total Price',
			googlePay: true,
			applePay: true,
			vaultManager: true,
			darkTheme: true,
		})
		.then(result => console.log(result))
		.catch((error) => {
			if (error.code === 'USER_CANCELLATION') {
				// update your UI to handle cancellation
			} else {
				// update your UI to handle other errors
				console.log(error)
			}
		});
		// Fire.shared.getStripeCardInfo(Fire.shared.uid).then((stripeinfo) => {
		// 	if (isEmpty(stripeinfo)) {
		// 		Toast.show({ text: Strings.ST25, position: 'bottom', duration: Global.ToastDuration });
		// 		this.setState({
		// 			showCardInput: true
		// 		})
		// 	} else {
		// 		this.nextProcess(stripeinfo);
		// 	}
		// }).catch(() => this.setState({ confirmProcessing: false }))
	}

	nextProcess = async (stripeinfo) => { // checkoutobjs, date, time, location, totalprice
		// pickup info valid check
		if (this.state.date === '') {
			Toast.show({ text: Strings.ST26, position: 'bottom', duration: Global.ToastDuration });
			this.setState({ confirmProcessing: false });
			return;
		}
		if (this.state.time === '') {
			Toast.show({ text: Strings.ST27, position: 'bottom', duration: Global.ToastDuration });
			this.setState({ confirmProcessing: false });
			return;
		}
		if (this.state.location === '') {
			Toast.show({ text: Strings.ST28, position: 'bottom', duration: Global.ToastDuration });
			this.setState({ confirmProcessing: false });
			return;
		}

		// get card token
		const tempArray = stripeinfo.number.split(' ');
		let cardNumber = ''
		for (let i = 0; i < tempArray.length; i++) {
			const element = tempArray[i];
			cardNumber += element;
		}
		const exp_month = stripeinfo.expiry.substring(0, 2);
		const exp_year = stripeinfo.expiry.substring(3, 5);
		const cvc = stripeinfo.cvc;

		const information = {
			card: {
				number: cardNumber,
				exp_month: exp_month,
				exp_year: exp_year,
				cvc: cvc,
				name: Fire.shared.email,
			}
		}
		const cardtoken = await stripe.createToken(information);

		// checkout charge
		const myuid = Fire.shared.uid;
		let chargePrice = 0;
		if (this.state.everBuy) {
			chargePrice = this.state.totalPrice * 100;
		} else {
			chargePrice = Math.round(this.state.totalPrice * 100 - (this.state.totalPrice * 5));
		}
		// const productId = this.state.checkoutObjs[0].postid;
		const transfer_group = this.state.checkoutObjs[0].selleruid;
		fetch(Global.stripeCheckoutUrl, {
			method: "POST",
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: cardtoken,
				amount: chargePrice,
				userinfo: myuid,
				transfer_group: transfer_group,
			}),
		}).then(res => {
			if (!res.ok) {
				Toast.show({ text: Strings.ST29, position: 'bottom', duration: Global.ToastDuration })
				this.setState({
					confirmProcessing: false
				})
				return;
			}
			res.json().then((chargeResponse) => {
				if (isEmpty(chargeResponse.charge)) {
					Toast.show({ text: Strings.ST29, position: 'bottom', duration: Global.ToastDuration })
					this.setState({
						confirmProcessing: false
					})
					return;
				}
				const charge = chargeResponse.charge;
				if (charge.status !== "succeeded") {
					Toast.show({ text: Strings.ST29, position: 'bottom', duration: Global.ToastDuration })
					this.setState({
						confirmProcessing: false
					})
					return;
				} else {
					Toast.show({ text: Strings.ST30, position: 'bottom', duration: Global.ToastDuration })
					const chargeId = charge.id || '';
					setTimeout(() => {
						this.processAfterPaymentSuccess(chargeId);
					}, 1000);
				}
			}).catch((error) => {
				Global.isDev && console.log(error)
				this.setState({
					confirmProcessing: false
				})
				Toast.show({ text: Strings.ST29, position: 'bottom', duration: Global.ToastDuration })
			});
		}).catch(error => {
			Global.isDev && console.log(error)
			this.setState({
				confirmProcessing: false
			})
			Toast.show({ text: Strings.ST29, position: 'bottom', duration: Global.ToastDuration })
		});
	}

	processAfterPaymentSuccess(chargeId) {

		const checkoutObjs = this.state.checkoutObjs;
		const pickupinfo = {
			date: this.state.date,
			time: this.state.time,
			location: this.state.location
		}

		Fire.shared.checkoutConfirm(checkoutObjs, pickupinfo, chargeId, this.state.totalPrice, this.state.everBuy).then((transactionid) => {
			if (!transactionid) { // exists same transaction id
				this.setState({
					confirmProcessing: false
				})
				Toast.show({ text: Strings.ST02, position: 'bottom', buttonText: Strings.ST07, duration: Global.ToastDuration })
				return;
			}
			this.setState({
				confirmProcessing: false
			})
			const navigateAction = NavigationActions.navigate({
				routeName: 'BoughtAndSold',
				params: {
					uid: this.state.selleruid,
					username: this.state.sellerusername,
					bought: true,
					transactionid: transactionid,
				}
			});
			this.props.navigation.pop();
			this.props.navigation.dispatch(navigateAction);
		}).catch((err) => Global.isDev && console.log(err))

		// send push notification to seller
		sendPushNotification(this.state.selleruid, 'bought');
	}


	pressDelete(index) {
		if (this.state.confirmProcessing) return;
		let tempArray = this.state.checkoutObjs;
		let totalPrice = this.state.totalPrice;
		totalPrice -= tempArray[index].price;
		tempArray.splice(index, 1);
		this.setState({
			checkoutObjs: tempArray,
			totalPrice: totalPrice
		})
	}

	renderCheckoutObjs(item, index) {
		let subTextTitle = '', subTextContent = '';
		if (item.category === 1) {
			subTextTitle = 'size ';
			subTextContent = Global.sizeSet[item.size - 1];
		} else if (item.category === 4) {
			subTextTitle = 'code ';
			subTextContent = item.brand;
		}

		return (

			<View style={styles.feeditem_wrapper}>

				<View style={styles.feeditem_imagewrapper}>
					<Image
						source={{ uri: item.picture }}
						style={styles.feeditem_image}
						resizeMode='contain' />
				</View>
				<View style={styles.f03}>

				</View>
				<View style={styles.feedinfo}>
					<Text style={styles.text_black13}>{item.title}</Text>

					<TouchableOpacity onPress={this.pressDelete.bind(this, index)} style={styles.delete_wrapper}>
						<Text style={styles.deletetext}>delete</Text>
					</TouchableOpacity>


					{subTextTitle !== '' &&
						<View style={styles.frow}>
							<Text style={styles.text_regular13}>{subTextTitle}</Text>
							<Text style={styles.text_black12}>{subTextContent}</Text>
						</View>
					}

					<Text style={styles.text_regular13}>@{item.sellerusername}</Text>
				</View>
				<View style={styles.feeditem_price}>
					<Text style={styles.text_black13}>${item.price}</Text>
				</View>
			</View>
		)
	}

	renderItemSeparator() {
		return (
			<View style={{ height: 5 }}></View>
		)
	}

	render() {

		if (this.state.showCardInput) {
			return (
				<StripeCardInput pressOkCancel={this.pressCardOkCancel.bind(this)} />
			)
		}

		let pickupContent = '';
		if (this.state.location !== '' && this.state.date !== '' && this.state.time !== '') {
			pickupContent = this.state.location + ', ' + this.state.date + ', ' + this.state.time;
		}

		// price
		let totalPrice = this.state.totalPrice;
		if (!this.state.everBuy) {
			totalPrice = totalPrice - this.state.totalPrice * 5 / 100;
		}

		return (

			<View style={styles.container}>

				<AppHeaderArrow title={'checkout'} pressArrow={this.pressBackArrow.bind(this)} />

				<ScrollView style={styles.main_container} contentContainerStyle={styles.main_contentcontainer} >
					<View style={styles.main_wrapper} >

						<FlatList
							data={this.state.checkoutObjs}
							extraData={this.state}
							renderItem={({ item, index }) => this.renderCheckoutObjs(item, index)}
							keyExtractor={(item, index) => index.toString()}
							ItemSeparatorComponent={this.renderItemSeparator}
							keyboardShouldPersistTaps="always"
						/>


						{/* add more button */}
						<TouchableOpacity onPress={this.pressAddmore.bind(this)} style={styles.addmore_wrapper}>
							<Text style={styles.addmore_text}>add more from @{this.state.sellerusername}</Text>
						</TouchableOpacity>

						{/* propose a pickup */}
						<Text style={styles.proposetext}>propose a pickup</Text>


						{/* date, time, location */}
						<View style={styles.pickup_wrapper}>

							<TouchableOpacity style={styles.date_wrapper} onPress={this.pressdate.bind(this)}>
								<Text style={styles.text_black14}>date </Text>
								<Ionicons name="md-arrow-dropdown" size={20} color={'black'} />
							</TouchableOpacity>

							<TouchableOpacity style={styles.time_wrapper} onPress={this.presstime.bind(this)}>
								<Text style={styles.text_black14}>time </Text>
								<Ionicons name="md-arrow-dropdown" size={20} color={'black'} />
							</TouchableOpacity>

							<View style={styles.location_wrapper}>
								<TextInput maxLength={Global.TM20} autoCapitalize='none' multiline={false} style={styles.location_input} placeholder='location' placeholderTextColor='black' value={this.state.location} onChangeText={(text) => { if (this.state.confirmProcessing) return; this.setState({ location: text }) }}></TextInput>
							</View>

						</View>

						{/* datepicker, timepicker */}
						<View style={styles.pickedarea}>
							<View style={styles.datepicked_wrapper}>
								{this.state.showPickedDate &&
									<Text style={styles.text_bold12}>{this.state.date}</Text>
								}

								<DatePicker
									style={styles.picker_control}
									date={this.state.date}
									mode="date"
									format="MM/DD/YYYY"
									minDate={this.state.dateBoxMin}
									maxDate="12/31/2100"
									showIcon={false}
									hideText
									confirmBtnText="Confirm"
									cancelBtnText="Cancel"
									ref={(control) => this.datePicker = control}
									onDateChange={(date) => { this.setState({ date: date, showPickedDate: true }) }}
								/>

							</View>
							<View style={styles.timepicked_wrapper}>
								{this.state.showPickedTime &&
									<Text style={styles.text_bold12}>{this.state.time}</Text>
								}

								<DatePicker
									style={styles.picker_control}
									date={this.state.time}
									mode="time"
									showIcon={false}
									hideText
									confirmBtnText="Confirm"
									cancelBtnText="Cancel"
									ref={(control) => this.timePicker = control}
									// is24Hour
									onDateChange={(time) => { this.setState({ time: time, showPickedTime: true }) }}
								/>

							</View>
							<View style={styles.space1}></View>
						</View>


						{!this.state.everBuy &&
							<View style={styles.discounttext_wrapper}>
								<Text style={styles.discounttext}>this is your first purchase.</Text>
								<Text style={styles.discounttext}>5% discount</Text>
							</View>
						}


						<View style={styles.line}></View>


						{/* total */}
						<View style={styles.totalitem_wrapper}>
							<Text style={styles.text_black15}>total</Text>
							<Text style={styles.text_black15}>${totalPrice}</Text>
						</View>

						<View style={styles.totalitem_wrapper}>
							<Text style={styles.text_black15}>pickup</Text>
							<Text style={styles.text_regular13}>{pickupContent}</Text>
						</View>

						{/* confirm */}
						<TouchableOpacity onPress={this.pressConfirm.bind(this)} style={styles.confirm_wrapper}>
							{this.state.confirmProcessing ?
								<ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
								:
								<Text style={styles.confirm_text}>confirm</Text>
							}

						</TouchableOpacity>

						<View style={{ height: 50 }}></View>
					</View>

				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center"
	},
	main_container: {
		flex: 1,
		width: Global.screenWidth,
		height: "100%",
		marginBottom: Global.TabBarHeight
	},
	main_contentcontainer: {
		alignItems: "center"
	},
	text_black15: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 15
	},
	text_regular13: {
		fontFamily: Global.Nimbus_Regular,
		fontSize: 13
	},
	text_black12: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 12
	},
	text_black13: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 13
	},
	deletetext: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 12,
		color: Global.colorButtonBlue
	},
	delete_wrapper: {
		marginVertical: 5,
		width: "50%",
		height: "18%",
		backgroundColor: "white",
		justifyContent: "center",
		alignItems: "center"
	},
	feedinfo: {
		flex: 0.37,
		flexDirection: "column",
		marginTop: 5
	},
	feeditem_imagewrapper: {
		flex: 0.35
	},
	feeditem_wrapper: {
		width: "100%",
		height: imageHeight,
		flexDirection: "row"
	},
	feeditem_image: {
		width: "100%",
		height: "100%"
	},
	feeditem_price: {
		flex: 0.25,
		justifyContent: "center",
		alignItems: "flex-end"
	},
	main_wrapper: {
		width: "85%",
		flexDirection: "column"
	},
	addmore_wrapper: {
		marginTop: 10,
		width: "70%",
		height: 30,
		backgroundColor: Global.colorButtonBlue,
		justifyContent: "center",
		alignItems: "center"
	},
	addmore_text: {
		lineHeight: 30,
		fontFamily: Global.Nimbus_Bold,
		fontSize: 12,
		color: "white"
	},
	proposetext: {
		marginTop: 30,
		alignSelf: "center",
		fontFamily: Global.Nimbus_Black,
		fontSize: 17
	},
	pickup_wrapper: {
		marginTop: 20,
		width: "100%",
		flexDirection: "row"
	},
	date_wrapper: {
		flex: 0.3,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	},
	time_wrapper: {
		flex: 0.35,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	},
	location_wrapper: {
		flex: 0.35,
		justifyContent: "flex-start",
		borderBottomColor: "black",
		borderBottomWidth: 1
	},
	text_black14: {
		color: "black",
		fontFamily: Global.Nimbus_Black,
		fontSize: 14
	},
	location_input: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 14,
		fontWeight: "normal"
	},
	pickedarea: {
		width: "100%",
		flexDirection: "row"
	},
	datepicked_wrapper: {
		flex: 0.3,
		justifyContent: "center",
		flexDirection: "column",
		alignItems: "center"
	},
	timepicked_wrapper: {
		flex: 0.4,
		justifyContent: "center",
		flexDirection: "column",
		alignItems: "center"
	},
	space1: {
		flex: 0.3
	},
	picker_control: {
		width: 0,
		height: 0
	},
	discounttext_wrapper: {
		marginTop: 25,
		width: "80%",
		alignSelf: "center",
		flexDirection: "column",
		alignItems: "center"
	},
	discounttext: {
		fontFamily: Global.Nimbus_Bold,
		color: "#ff4ae7",
		fontSize: 18
	},
	line: {
		marginTop: 30,
		width: "100%",
		height: 1,
		backgroundColor: "black"
	},
	totalitem_wrapper: {
		marginTop: 10,
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between"
	},
	confirm_wrapper: {
		marginTop: 40,
		width: "90%",
		height: Math.round(Global.screenWidth * 0.13),
		alignSelf: "center",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Global.colorButtonBlue
	},
	confirm_text: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 18,
		color: "white",
		lineHeight: Math.round(Global.screenWidth * 0.13),
	},
	f03: {
		flex: 0.03
	},
	frow: {
		flexDirection: 'row'
	},
	text_bold12: {
		fontFamily: Global.Nimbus_Bold,
		fontSize: 12
	}
});