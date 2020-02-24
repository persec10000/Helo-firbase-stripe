
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AntDesign } from '@expo/vector-icons';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import { sendPushNotification } from '@utils/GlobalFunction';

const imageHeight = Math.round(Global.screenWidth * 0.51);

export default class PickupAndDropoffSuccess extends Component { // 'PickupAndDropoffSuccess'
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        const { params } = props.navigation.state;
        this.state = {
            me: params.me,
            otheruid: params.otheruid,
            otherusername: params.otherusername,
            transactionid: params.transactionid,
            postids: params.postids,
            price: params.price || 0,
            wasAutoReleased: params.wasAutoReleased,
            firstbuy: params.firstbuy,
            accountIdOfSeller: '',
            review: '',
            colorReviewBorder: 'black',
            star: 0,
            colorStar: 'black',
            doneProcessing: false
        };
    }

    componentDidMount() {
        if (this.state.me) {
            Fire.shared.getSellerAccountId(this.state.otheruid).then((res) => {
                this.setState({
                    accountIdOfSeller: res,
                })
            }).catch((error) => Global.isDev && console.log(error));
        }
    }
    processError(error) {
        this.setState({ doneProcessing: false });
        Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration });
        Global.isDev && console.log(error)
    }
    moveToHomeScreen() {
        const navigateAction = NavigationActions.navigate({
            routeName: 'HomeScreen',
        });
        this.props.navigation.pop(); this.props.navigation.pop();
        this.props.navigation.dispatch(navigateAction);
    }
    pressDone() {
        if (this.state.doneProcessing) return;
        this.setState({ doneProcessing: true })

        if (this.state.me) { // true:buyer
            if (this.state.wasAutoReleased) {
                Fire.shared.setPickupSuccess(this.state.otheruid, this.state.star, this.state.review, this.state.postids, this.state.transactionid, this.state.me).then(() => {
                    this.setState({
                        doneProcessing: false,
                    })
                    this.moveToHomeScreen();
                }).catch((error) => Global.isDev && console.log(error));
            } else {
                if (isEmpty(this.state.accountIdOfSeller)) {
                    this.processError('no seller account id');
                    return;
                }
                // money release to seller
                const postPrice = parseFloat(this.state.price);
                const chargeFee = postPrice * 29 / 1000 + 0.3;
                const appOwnerFee = postPrice * 5 / 100;
                const transferPrice = postPrice - chargeFee - appOwnerFee;
                const transferPriceHundred = parseFloat(transferPrice.toFixed(2)) * 100;

                fetch(Global.stripeReleaseToSellerUrl, {
                    method: "POST",
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    description: 'transfer to connected account',
                    body: JSON.stringify({
                        accountId: this.state.accountIdOfSeller,
                        amount: transferPriceHundred,
                        transfer_group: this.state.otheruid, // seller's uid
                    }),
                }).then((res) => {
                    if (!res.ok) {
                        Toast.show({ text: Strings.ST34, position: 'bottom', duration: Global.ToastDuration })
                        this.setState({
                            doneProcessing: false
                        })
                        return;
                    }
                    res.json().then((transferRes) => {
                        Toast.show({ text: Strings.ST35, position: 'bottom', duration: Global.ToastDuration });
                        sendPushNotification(this.state.otheruid, 'released');
                        Fire.shared.addEarnedToApp(postPrice, this.state.firstbuy);
                        Fire.shared.addEarnedToSeller(this.state.otheruid, transferPrice.toFixed(2)).then(() => {
                            Fire.shared.setPickupSuccess(this.state.otheruid, this.state.postids, this.state.transactionid, this.state.me).then(() => {
                                if (this.state.star === 0 || this.state.review === '') {
                                    this.setState({ doneProcessing: false });
                                    this.moveToHomeScreen();
                                } else {
                                    Fire.shared.leaveReview(this.state.otheruid, this.state.star, this.state.review).then(() => {
                                        this.setState({ doneProcessing: false });
                                        this.moveToHomeScreen();
                                    }).catch((error) => {
                                        this.processError(error);
                                    });
                                }
                            }).catch((error) => this.processError(error));
                        }).catch((error) => this.processError(error));
                    })
                }).catch((error) => {
                    this.processError(error);
                });
            }
        } else { // seller
            Fire.shared.setPickupSuccess(this.state.otheruid, this.state.postids, this.state.transactionid, this.state.me).then(() => {
                if (this.state.star === 0 || this.state.review === '') {
                    this.setState({ doneProcessing: false });
                    this.moveToHomeScreen();
                } else {
                    Fire.shared.leaveReview(this.state.otheruid, this.state.star, this.state.review).then(() => {
                        this.setState({ doneProcessing: false });
                        this.moveToHomeScreen();
                    }).catch((error) => {
                        this.processError(error);
                    });
                }
            }).catch((error) => this.processError(error));
        }
    }

    pressStarIcon(index) { // 1~5
        this.setState({
            star: index
        })
    }
    renderFiveStar(starNumber = 5, oneSize = 10, interval = 5) {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity onPress={this.pressStarIcon.bind(this, i)} key={i} style={{ marginRight: (i == 5) ? 0 : interval }}>
                    <AntDesign name={i <= starNumber ? "star" : "staro"} size={oneSize} color={this.state.colorStar} />
                </TouchableOpacity>
            )
        }
        return (
            <View style={styles.f_row}>
                {stars}
            </View>
        );
    }

    render() {

        return (

            <KeyboardAwareScrollView contentContainerStyle={styles.main_contentcontainer} scrollEnabled={false}>
                {/* hearder */}
                <View style={styles.header_wrapper}>
                    <Text style={Global.HeaderSmall}>success!</Text>
                </View>


                <View style={styles.main_container}>

                    <View style={styles.f_06}></View>

                    {/* backimage */}
                    <View style={styles.bkimage_wrapper}>
                        <Image
                            source={require('@images/back_pickupdropoffsuccess.png')}
                            style={styles.bkimage}
                            resizeMode='contain' />
                    </View>

                    <View style={styles.username_wrapper}>
                        <Text style={styles.text_black16}>how was your {this.state.me ? 'pickup' : 'dropoff'}</Text>
                        <Text style={styles.text_bold16}>{this.state.me ? 'with' : 'to'} @{this.state.otherusername}?</Text>
                    </View>

                    <View style={styles.stars_wrapper}>
                        {this.renderFiveStar(this.state.star, 25, 10)}
                    </View>

                    <View style={styles.leavetext_wrapper}>
                        <Text style={styles.text_black14}>leave a review</Text>
                    </View>

                    <View style={[styles.review_wrapper, { borderBottomColor: this.state.colorReviewBorder }]}>
                        <TextInput onChangeText={text => this.setState({ review: text })} autoCapitalize='sentences' multiline={true} textAlignVertical='bottom' maxLength={Global.TM200} style={styles.review_input} placeholder=""></TextInput>
                    </View>

                    <View style={styles.done_wrapper}>

                        {!this.state.doneProcessing &&
                            <TouchableOpacity onPress={this.pressDone.bind(this)} style={{ paddingBottom: 20 }}>
                                <Text style={styles.text_black16}>done</Text>
                            </TouchableOpacity>
                        }

                        {this.state.doneProcessing &&
                            <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                        }
                    </View>


                </View>

            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    main_contentcontainer: {
        flex: 1,
        backgroundColor: Global.colorYellow,
        alignItems: "center"
    },
    header_wrapper: {
        width: "100%",
        height: Math.round(Global.screenWidth * 0.2),
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 10
    },
    main_container: {
        flex: 1,
        width: "100%",
        height: "100%",
        flexDirection: "column",
        marginBottom: Global.TabBarHeight
    },
    bkimage_wrapper: {
        flex: 0.39,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    bkimage: {
        width: "90%",
        height: imageHeight
    },
    username_wrapper: {
        flex: 0.15,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    text_black16: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 16,
        lineHeight: 16
    },
    text_bold16: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 16,
        lineHeight: 16
    },
    text_black14: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 14
    },
    stars_wrapper: {
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center"
    },
    leavetext_wrapper: {
        flex: 0.06,
        width: "85%",
        alignSelf: "center",
        justifyContent: "flex-end"
    },
    review_wrapper: {
        flex: 0.08,
        width: "85%",
        alignSelf: "center",
        borderBottomWidth: 1,
        justifyContent: "flex-end"
    },
    review_input: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13,
        fontWeight: "normal"
    },
    done_wrapper: {
        flex: 0.16,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    f_row: {
        flexDirection: 'row'
    },
    f_06: {
        flex: 0.06
    }
});