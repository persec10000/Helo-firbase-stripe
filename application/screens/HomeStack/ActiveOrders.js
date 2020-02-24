
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import AppHeaderArrow from '@components/AppHeaderArrow';

const itemHeight = Math.round(Global.screenWidth * 0.37);
const avatarWidth = Math.round(Global.screenWidth * 0.13);
const imageWidth = Math.round(Global.screenWidth * 0.16);

export default class ActiveOrders extends Component { // 'ActiveOrdersScreen'
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataArray: [],
            usernameavatar_asuid: {},
        };
    }

    componentDidMount() {
        Fire.shared.getMyOrders('active_orders').then((res) => {
            if (isEmpty(res)) {
                this.setState({
                    loading: false
                })
                return;
            }
            let uidarray = [];
            for (let i = 0; i < res.length; i++) {
                if (!uidarray.includes(res[i].other)) {
                    uidarray.push(res[i].other)
                }
            }

            Fire.shared.getUserNamesAndAvatars(uidarray).then((usernamesandavatars) => {
                this.setState({
                    usernameavatar_asuid: usernamesandavatars,
                    dataArray: res,
                    loading: false,
                })
            })
        }).catch((error) => Global.isDev && console.log(error));
    }

    pressArrow() {
        const { params } = this.props.navigation.state;
        if (params && params.from) {
            if (params.from === 'OtherProfileScreen') {
                const navigateAction = NavigationActions.navigate({
                    routeName: 'HomeScreen',
                });
                this.props.navigation.dispatch(navigateAction);
                return;
            } else {
                const navigateAction = NavigationActions.navigate({
                    routeName: params.from,
                });
                this.props.navigation.dispatch(navigateAction);
                return;
            }
        } else {
            this.props.navigation.goBack()
        }
    }

    pressViewChat(transactionid) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OrderChatScreen',
            params: {
                from: 'ActiveOrdersScreen',
                transactionid
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }

    pressConfirmPickup(item) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'PickupAndDropoffConfirm',
            params: {
                from: 'ActiveOrdersScreen',
                me: item.me,
                otheruid: item.other,
                otherusername: this.state.usernameavatar_asuid[item.other].username,
                transactionid: item.transactionid,
                postids: item.postids,
                price: item.price,
                firstbuy: item.firstbuy || false,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    pressUser(uid) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'ActiveOrdersScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    renderFlatListItem(item) {
        if (isEmpty(this.state.usernameavatar_asuid[item.other])) return;
        let pictureGrop = [];
        for (var i = 0; i < item.pictures.length; i++) {
            pictureGrop.push(
                <View key={i} style={styles.storeimage}>
                    <Image
                        source={{ uri: item.pictures[i] }}
                        style={styles.wh100}
                        resizeMode='contain' />
                </View>
            )
        }
        let location, date, time = '';
        let pickupTimePassed = false;

        if (item.status === 2) {
            if (isEmpty(item.pickupinfo.location) || isEmpty(item.pickupinfo.date) || isEmpty(item.pickupinfo.time)) {
                return;
            }
            location = item.pickupinfo.location;
            date = item.pickupinfo.date.substring(0, 2) + '.' + item.pickupinfo.date.substring(3, 5) + '.' + item.pickupinfo.date.substring(8, 10)
            const hour = parseInt(item.pickupinfo.time.substring(0, 2));
            if (hour > 12) {
                time = (hour - 12).toString() + ':' + item.pickupinfo.time.substring(3, 5) + ' pm';
            } else {
                time = hour.toString() + ':' + item.pickupinfo.time.substring(3, 5) + ' am';
            }

            let pickupDate = new Date();
            pickupDate.setFullYear(parseInt(item.pickupinfo.date.substring(6, 10)));
            pickupDate.setMonth(parseInt(item.pickupinfo.date.substring(0, 2) - 1));
            pickupDate.setDate(parseInt(item.pickupinfo.date.substring(3, 5)));
            pickupDate.setHours(parseInt(item.pickupinfo.time.substring(0, 2)));
            pickupDate.setMinutes(parseInt(item.pickupinfo.time.substring(3, 5)));
            const pickupTimeStamp = pickupDate.getTime();
            const currentTimeStamp = new Date().getTime();
            if (currentTimeStamp > pickupTimeStamp) {
                pickupTimePassed = true;
            }
        }

        return (
            <View style={[styles.item_container, { backgroundColor: item.status === 2 ? '#C4E1C3' : 'transparent' }]}>

                <View style={styles.f07}></View>

                <View style={styles.avatar_area}>
                    <TouchableOpacity onPress={this.pressUser.bind(this, item.other)} style={styles.avatar_wrapper}>
                        <Image
                            source={{ uri: this.state.usernameavatar_asuid[item.other].avatar }}
                            style={styles.avatar}
                            resizeMode='contain' />
                    </TouchableOpacity>
                </View>

                <View style={styles.orderinfo_container}>

                    <View style={styles.f13}></View>

                    <TouchableOpacity onPress={this.pressUser.bind(this, item.other)} style={styles.f13}>
                        <Text style={styles.text_black13}>@{this.state.usernameavatar_asuid[item.other].username}</Text>
                    </TouchableOpacity>

                    <View style={styles.storeimages}>

                        {pictureGrop}

                        {item.status < 2 ?
                            <View style={styles.item_pickupinfo_wrapper}>
                                <Text style={styles.text_black13}>pickup</Text>
                                <Text style={styles.text_black13}>pending</Text>
                            </View>
                            :
                            <View style={styles.item_pickupinfo_wrapper}>
                                <Text style={styles.text_regular13}>pickup confirmed</Text>
                                <Text style={styles.text_black13}>{location}</Text>
                                <Text style={styles.text_black13}>{date}</Text>
                                <Text style={styles.text_black13}>{time}</Text>
                            </View>
                        }

                    </View>

                    <View style={styles.item_chatbtn_container}>
                        <TouchableOpacity onPress={this.pressViewChat.bind(this, item.transactionid)} style={styles.item_chatbtn}>
                            <Text style={styles.item_chattext}>view chat</Text>
                        </TouchableOpacity>

                        {(item.status === 2 && pickupTimePassed) &&
                            <TouchableOpacity onPress={this.pressConfirmPickup.bind(this, item)} style={styles.item_confirmbtn_wrapper}>
                                <Text style={styles.item_confirmtext}>confirm pickup</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        )
    }

    render() {

        return (

            <View style={styles.container}>

                {/* hearder */}
                <AppHeaderArrow title={'active orders'} pressArrow={this.pressArrow.bind(this)} />

                <ScrollView style={styles.list_wrapper}>

                    {this.state.loading &&
                        <View style={styles.indicator_wrapper}>
                            <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                        </View>
                    }
                    {!this.state.loading &&
                        <FlatList
                            data={this.state.dataArray}
                            extraData={this.state}
                            renderItem={({ item }) => this.renderFlatListItem(item)}
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
    list_wrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column'
    },
    indicator_wrapper: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_container: {
        width: '100%',
        height: itemHeight,
        flexDirection: 'row',
        borderBottomColor: 'black',
        borderBottomWidth: 1
    },
    avatar_wrapper: {
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: Math.round(avatarWidth / 2),
        overflow: 'hidden',
        marginTop: Math.round(itemHeight * 0.15)
    },
    avatar: {
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: Math.round(avatarWidth / 2)
    },
    text_black13: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 13
    },
    text_regular13: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13
    },
    item_pickupinfo_wrapper: {
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 5
    },
    item_chatbtn_container: {
        flex: 0.3,
        paddingLeft: 15,
        paddingTop: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: '10%'
    },
    item_chatbtn: {
        width: '40%',
        height: '60%',
        backgroundColor: Global.colorButtonBlue,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_chattext: {
        lineHeight: Math.round(itemHeight * 0.18),
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13,
        color: 'white'
    },
    item_confirmbtn_wrapper: {
        width: '50%',
        height: '60%',
        backgroundColor: Global.colorYellow,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_confirmtext: {
        lineHeight: Math.round(itemHeight * 0.18),
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13,
        color: Global.colorButtonBlue
    },
    wh100: {
        width: '100%',
        height: '100%'
    },
    storeimage: {
        width: imageWidth,
        height: imageWidth,
        marginRight: 5
    },
    f07: {
        flex: 0.07
    },
    avatar_area: {
        flex: 0.13,
        height: '100%'
    },
    orderinfo_container: {
        flex: 0.8,
        flexDirection: 'column'
    },
    f13: {
        flex: 0.13
    },
    storeimages: {
        flex: 0.44,
        flexDirection: 'row',
        paddingLeft: 15
    },
    container: {
        flex: 1,
        backgroundColor: Global.colorGreen,
        alignItems: 'center'
    }
});