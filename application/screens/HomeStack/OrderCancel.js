
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Text, TextInput, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';


export default class OrderCancel extends Component { //'OrderCancelScreen'
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
            refundChargeId: '',
            review: '',
            colorReviewBorder: 'black',
            star: 0,
            colorStar: 'black',
            doneProcessing: false,
            isIphoneX: false,
        };
    }

    componentDidMount() {
        Fire.shared.getRefundChargeId(this.state.transactionid).then((chargeId) => {
            this.setState({
                refundChargeId: chargeId,
            })
        }).catch((error) => Global.isDev && console.log(error));
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

        this.setState({ doneProcessing: true });

        if (this.state.me) { // true => buyer
            if (this.state.refundChargeId === '') {
                this.processError('no charge id for refund');
                return;
            }
            fetch(Global.stripeRefundToBuyerUrl, {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                description: 'refund charge',
                body: JSON.stringify({
                    chargeId: this.state.refundChargeId
                }),
            }).then(res => {
                if (!res.ok) {
                    this.processError('refund fetch error');
                    return;
                }
                res.json().then((refundRes) => {
                    if (refundRes.error) {
                        this.processError(refundRes.error);
                        return;
                    }
                    Toast.show({ text: Strings.ST32, position: 'bottom', duration: Global.ToastDuration });
                    Fire.shared.cancelOrder(this.state.transactionid, this.state.me, this.state.otheruid, this.state.postids);
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
                })
            }).catch((error) => {
                this.processError(error);
            });
        } else { // seller
            Fire.shared.cancelOrder(this.state.transactionid, this.state.me, this.state.otheruid, this.state.postids);
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
        }
    }

    pressUser() {
        const uid = this.state.otheruid;
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'OrderCancelScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }

    pressLeftArrow() {
        const { params } = this.props.navigation.state;
        if (params && params.from) {
            if (params.from === 'OtherProfileScreen') {
                this.props.navigation.goBack()
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
    
    getIsIphoneX(event) {
        const { y } = event.nativeEvent.layout;
        if (y > 40) {
            this.setState({ isIphoneX: true });
        }
    }

    render() {

        return (
            <SafeAreaView style={styles.safearea_container}>
                <KeyboardAwareScrollView onLayout={(event) => this.getIsIphoneX(event)} contentContainerStyle={styles.main_contentcontainer} scrollEnabled={false}>

                    {/* hearder */}
                    <View style={styles.header_wrapper}>
                        <Text style={Global.HeaderSmall}>order cancelled.</Text>
                    </View>

                    <View style={styles.main_container}>
                        <View style={styles.username_wrapper}>
                            <Text style={styles.text_black16}>rate </Text>
                            <Text style={styles.text_bold16}>@{this.state.otherusername}</Text>
                        </View>

                        <View style={styles.stars_wrapper}>
                            {this.renderFiveStar(this.state.star, 25, 10)}
                        </View>

                        <View style={styles.leavetext_wrapper}>
                            <Text style={styles.text_black14}>leave a review</Text>
                        </View>

                        <View style={[styles.review_wrapper, { borderBottomColor: this.state.colorReviewBorder }]}>
                            <TextInput onChangeText={text => this.setState({ review: text })} autoCapitalize='sentences' multiline={true} maxLength={Global.TM200} textAlignVertical='bottom' style={styles.review_input} placeholder=""></TextInput>
                        </View>


                        <View style={styles.done_wrapper}>
                            {this.state.doneProcessing ?
                                <View style={styles.indicator_wrapper}>
                                    <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                                </View>
                                :
                                <TouchableOpacity onPress={this.pressDone.bind(this)} style={{ paddingBottom: this.state.isIphoneX ? 25 : Global.TabBarHeight + 15 }}>
                                    <Text style={styles.text_black16}>done</Text>
                                </TouchableOpacity>
                            }
                        </View>

                    </View>

                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    done_wrapper: {
        flex: 0.51,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    safearea_container: {
        flex: 1,
        backgroundColor: Global.colorLoginBack
    },
    main_contentcontainer: {
        flex: 1,
        alignItems: "center"
    },
    header_wrapper: {
        width: "100%",
        height: Math.round(Global.screenWidth * 0.2),
        justifyContent: "flex-end",
        alignItems: "center"
    },
    text_black16: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 16
    },
    text_bold16: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 16
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
    main_container: {
        flex: 1,
        width: "85%",
        height: "100%",
        flexDirection: "column",
    },
    username_wrapper: {
        flex: 0.16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end"
    },
    leavetext_wrapper: {
        flex: 0.12,
        justifyContent: "flex-end"
    },
    review_wrapper: {
        flex: 0.11,
        borderBottomWidth: 1,
        justifyContent: "flex-end"
    },
    review_input: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13,
        fontWeight: "normal"
    },
    indicator_wrapper: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    f_row: {
        flexDirection: 'row'
    }
});