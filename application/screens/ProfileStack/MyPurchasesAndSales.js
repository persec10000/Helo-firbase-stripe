
import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, FlatList, Text, ScrollView, ActivityIndicator } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import AppHeaderArrow from '@components/AppHeaderArrow';

const imageWidth = Math.round(Global.screenWidth * 0.28);
const itemMarginLeft = Math.round(Global.screenWidth * 0.06);
const itemspace = Math.round(imageWidth * 0.2);

export default class MyPurchasesAndSales extends Component { //'MyPurchasesAndSales'
	static navigationOptions = {
		header: null
	};

	constructor(props) {
		super(props);
		const { params } = props.navigation.state;
		this.state = {
			dataArray: [],
			isPurchases: params.isPurchases,
			loading: true,
		};
	}
	processError(error) {
		Global.isDev && console.log(error);
		this.setState({
			loading: false,
		})
	}
	componentDidMount() {
		const isPurchases = this.state.isPurchases;
		this.setState({
			loading: true,
		})
		Fire.shared.getMyPurchasesAndSales(isPurchases).then((res) => {
			if (isEmpty(res)) {
				this.setState({
					loading: false
				})
				return;
			}
			let uidarray = [];
			let postidsArray = [];
			for (let i = 0; i < res.length; i++) {
				if (!uidarray.includes(res[i].other)) {
					uidarray.push(res[i].other);
				}
				for (let j = 0; j < res[i].postids.length; j++) {
					const element = res[i].postids[j];
					postidsArray.push(element);
				}
			}

			Fire.shared.getUserNames(uidarray).then((usernames_asuid) => {
				return usernames_asuid;
			}).then((usernames_asuid) => {
				Fire.shared.getPostsInfo(postidsArray).then((postsinfo) => {
					let dataArray = [];
					for (let i = 0; i < res.length; i++) {
						for (let j = 0; j < res[i].postids.length; j++) {
							if (!isEmpty(postsinfo[res[i].postids[j]])) {
								const tempObj = {
									...postsinfo[res[i].postids[j]],
									username: usernames_asuid[res[i].other],
									uid: res[i].other,
								}
								dataArray.push(tempObj);
							}
						}
					}
					this.setState({
						dataArray: dataArray,
						loading: false,
					})
				}).catch((error) => this.processError(error));
			}).catch((error) => this.processError(error));
		}).catch((error) => this.processError(error));
	}
	pressUser(uid) {
		const navigateAction = NavigationActions.navigate({
			routeName: 'OtherProfileScreen',
			params: {
				from: 'MyPurchasesAndSales',
				uid: uid,
			}
		});
		this.props.navigation.dispatch(navigateAction);
	}
	renderFlatListItem(item) {
		let sizeContent = '';
		if (item.category === 1 && item.size > 0) {
			sizeContent = Global.sizeSet[item.size - 1];
		}
		return (
			<View style={styles.item_wrapper}>

				<Image
					source={{ uri: item.picture }}
					style={styles.item_image}
					resizeMode='contain' />

				<View style={styles.item_contentwrapper}>
					<Text style={styles.text_black14}>{item.title}</Text>
					<Text style={styles.text_black14}>${item.price}</Text>
					{item.category === 1 &&
						<View style={{ flexDirection: 'row' }}>
							<Text style={styles.text_regular14}>size </Text>
							<Text style={styles.text_black14}>{sizeContent}</Text>
						</View>
					}
					{item.category === 4 &&
						<Text style={styles.text_regular14}>@{item.brand}</Text>
					}
					<TouchableOpacity onPress={this.pressUser.bind(this, item.uid)} >
						<Text style={styles.text_regular14}>@{item.username}</Text>
					</TouchableOpacity>

				</View>

			</View>
		)
	}
	renderSeparator() {
		return (
			<View style={{ height: itemspace }}></View>
		)
	}
	render() {
		const headertitle = 'my ' + (this.state.isPurchases ? 'purchases' : 'sales');
		return (
			<View style={{ flex: 1, alignItems: 'center', backgroundColor: this.state.isPurchases ? Global.colorLoginBack : Global.colorGreen }}>

				<AppHeaderArrow title={headertitle} pressArrow={() => this.props.navigation.goBack()} />

				<ScrollView style={styles.main_container} >

					{this.state.loading ?
						<View style={styles.indicator_wrapper}>
							<ActivityIndicator style={styles.indicator} size="large" color="#f39c12" />
						</View>
						:
						<FlatList
							data={this.state.dataArray}
							extraData={this.state}
							renderItem={({ item }) => this.renderFlatListItem(item)}
							ItemSeparatorComponent={this.renderSeparator}
							keyExtractor={(item, index) => index.toString()}
						/>
					}

				</ScrollView>

				<View style={{ height: Global.TabBarHeight }}></View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	item_wrapper: {
		width: "100%",
		flexDirection: "row"
	},
	item_image: {
		marginLeft: itemMarginLeft,
		width: imageWidth,
		height: imageWidth
	},
	item_contentwrapper: {
		marginLeft: 20,
		flexDirection: "column"
	},
	text_black14: {
		fontFamily: Global.Nimbus_Black,
		fontSize: 14
	},
	text_regular14: {
		fontFamily: Global.Nimbus_Regular,
		fontSize: 14
	},
	main_container: {
		flex: 1,
		width: "100%",
		height: "100%",
		flexDirection: "column",
		paddingTop: 10
	},
	indicator_wrapper: {
		width: "100%",
		height: 50,
		justifyContent: "center",
		alignItems: "center"
	},
	indicator: {
		width: 20,
		height: 20
	}
});