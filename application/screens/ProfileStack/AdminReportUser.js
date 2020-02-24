
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import AppHeaderArrow from '@components/AppHeaderArrow';
import { FontAwesome, Foundation, Entypo } from '@expo/vector-icons';
import { setUserSuspend } from '@utils/GlobalFunction'
import { Toast } from 'native-base';
import { removeUser } from '@utils/GlobalFunction';

const avatarWidth = 50;
const space1 = 30; // horizontal margin

// user type: 0:general 1:suspend 2:deleted
export default class AdminReportUser extends Component { // 'AdminReportUser'
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataArray: [],
            usersInfo: {},
            userAction: {
                show_from: false,
                show_to: false,
                index: -1,
            },
            processing: false,
        };
    }

    componentDidMount() {
        Fire.shared.getReportList().then((result) => {
            if (isEmpty(result)) {
                this.setState({
                    loading: false
                })
                return;
            }
            let uidarray = [];
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                if (!uidarray.includes(element.from_uid)) {
                    uidarray.push(element.from_uid)
                }
                if (!uidarray.includes(element.to_uid)) {
                    uidarray.push(element.to_uid)
                }
            }
            Fire.shared.getUserInfoForReportList(uidarray).then((usersinfo) => {
                this.setState({
                    usersInfo: usersinfo,
                    dataArray: result,
                    loading: false,
                })
            })
        }).catch((error) => {
            this.setState({ loading: false });
            Global.isDev && console.log(error)
        });
    }
    pressUser(uid) {
        if (uid === Fire.shared.uid) {
            return;
        }
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'AdminReportUser',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    timeConverter(timestamp) {
        const a = new Date(timestamp * 1);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let month = months[a.getMonth()];
        let date = a.getDate();
        let time = month + ' ' + date;
        return time;
    }
    pressAvatar(isFrom, index) {
        const uid = isFrom ? this.state.dataArray[index].from_uid : this.state.dataArray[index].to_uid;
        const email = isFrom ? this.state.dataArray[index].from_email : this.state.dataArray[index].to_email;
        Fire.shared.checkAdmin(email).then((result) => {
            if (!result) {
                if (this.state.usersInfo[uid].type === 2) return;
                if (index === this.state.userAction.index && (isFrom === this.state.userAction.show_from)) {
                    this.setState({
                        userAction: {
                            show_from: false,
                            show_to: false,
                            index: -1,
                        }
                    })
                    return;
                }
                this.setState({
                    userAction: {
                        show_from: isFrom,
                        show_to: !isFrom,
                        index: index,
                    },
                })
            }
        })
    }
    pressUserAction(isDelete) {
        this.setState({
            processing: true,
        })
        const report_item = this.state.dataArray[this.state.userAction.index];
        const who_uid = this.state.userAction.show_from ? report_item.from_uid : report_item.to_uid;
        const user_status = this.state.usersInfo[who_uid].type;
        if (isDelete) { // delete
            Fire.shared.closeAccount(who_uid).then(() => {
                removeUser(who_uid);
                let usersInfo = this.state.usersInfo;
                usersInfo[who_uid].type = 2;
                this.setState({
                    userAction: {
                        show_from: false,
                        show_to: false,
                        index: -1,
                    },
                    usersInfo: usersInfo,
                    processing: false,
                })
            }).catch(() => {
                this.setState({
                    processing: false,
                })
                Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
            })
        } else { // suspend
            if (user_status === 0) { // general -> suspend
                setUserSuspend(who_uid, true).then((result) => { // true or false
                    if (result) {
                        let usersInfo = this.state.usersInfo;
                        usersInfo[who_uid].type = 1;
                        this.setState({
                            userAction: {
                                show_from: false,
                                show_to: false,
                                index: -1,
                            },
                            usersInfo: usersInfo,
                            processing: false,
                        })
                    } else {
                        this.setState({
                            processing: false,
                        })
                        Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
                    }
                }).catch(() => {
                    this.setState({
                        processing: false,
                    })
                    Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
                })
            } else if (user_status === 1) { // suspend -> general
                setUserSuspend(who_uid, false).then((result) => { // true or false
                    if (result) {
                        let usersInfo = this.state.usersInfo;
                        usersInfo[who_uid].type = 0;
                        this.setState({
                            userAction: {
                                show_from: false,
                                show_to: false,
                                index: -1,
                            },
                            usersInfo: usersInfo,
                            processing: false,
                        })
                    } else {
                        this.setState({
                            processing: false,
                        })
                        Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
                    }
                }).catch(() => {
                    this.setState({
                        processing: false,
                    })
                    Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
                })
            }
        }
    }

    renderUserArea(isFromRender, item, index) {
        const uid = isFromRender ? item.from_uid : item.to_uid;
        const avatar_url = isFromRender ? this.state.usersInfo[uid].avatar : this.state.usersInfo[uid].avatar;
        const avatar = avatar_url === '' ? require('@images/avatar.png') : { uri: avatar_url };
        const deleted_status = this.state.usersInfo[uid].type === 2 ? true : false;
        const suspended_status = this.state.usersInfo[uid].type === 1 ? true : false;
        const show_ref = isFromRender ? this.state.userAction.show_from : this.state.userAction.show_to;

        return (
            <View style={styles.userarea_wrapper}>
                <TouchableOpacity onPress={this.pressAvatar.bind(this, isFromRender, index)} style={styles.avatar_wrapper}>
                    <Image
                        source={avatar}
                        style={styles.avatar}
                        resizeMode='contain' />
                </TouchableOpacity>
                {(show_ref && index === this.state.userAction.index) &&
                    <View style={styles.useraction_wrapper}>
                        <TouchableOpacity onPress={this.pressUserAction.bind(this, false)}>
                            <Foundation name="shield" size={23} color={'black'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.pressUserAction.bind(this, true)}>
                            <FontAwesome name="user-times" size={20} color={'black'} />
                        </TouchableOpacity>

                    </View>
                }
                <View style={styles.useraction_result}>
                    {suspended_status &&
                        <Text style={styles.text_bold13blue}>suspended</Text>
                    }
                    {deleted_status &&
                        <Text style={styles.text_bold13blue}>deleted</Text>
                    }
                    {(this.state.processing && show_ref && index === this.state.userAction.index) &&
                        <View style={styles.useraction_indicator}>
                            <ActivityIndicator size="small" color="#f39c12" />
                        </View>
                    }
                </View>
            </View>
        )
    }

    pressDeleteReport(item, index) {
        const report_id = item.report_id;
        Fire.shared.deleteOneReport(report_id).then(() => {
            let dataArray = this.state.dataArray;
            dataArray.splice(index, 1);
            this.setState({
                dataArray: dataArray
            })
        }).catch(() => { })
    }

    renderFlatListItem(item, index) {
        if (isEmpty(this.state.usersInfo[item.from_uid]) || isEmpty(this.state.usersInfo[item.to_uid])) return;
        const time = this.timeConverter(item.time);
        const from_name = this.state.usersInfo[item.from_uid].username;
        const to_name = this.state.usersInfo[item.to_uid].username
        return (
            <View style={{
                width: '100%', flexDirection: 'column', borderBottomColor: 'black',
                borderBottomWidth: 1, marginTop: 20, paddingBottom: 20
            }}>

                {/* usernames */}
                <View style={styles.item_username}>
                    <Text style={styles.text_black13}>{from_name === '' ? '' : `@${from_name}`}</Text>
                    <Text style={styles.text_black13}>{to_name === '' ? '' : `@${to_name}`}</Text>
                </View>

                {/* avatar - reporttext - avatar */}
                <View style={styles.item_reporttext_wrapper}>

                    {this.renderUserArea(true, item, index)}

                    {/* report text */}
                    <View style={{ width: Global.screenWidth - space1 * 4 - avatarWidth * 2 }}>
                        {item.report.map((oneitem, index) => {
                            let oneText = '';
                            if (oneitem.who) {
                                oneText = ' @' + from_name + ': ' + oneitem.text;
                            } else {
                                oneText = ' @' + to_name + ': ' + oneitem.text;
                            }
                            return (
                                <Text key={index} style={styles.item_onereporttext}>{oneText}</Text>
                            )
                        })}

                        <View style={styles.item_bottom}>
                            <Text style={styles.text_bold13}>{time}</Text>
                            <TouchableOpacity onPress={this.pressDeleteReport.bind(this, item, index)} style={styles.item_deletereport}>
                                <Text style={styles.item_deletetext}>delete report</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {this.renderUserArea(false, item, index)}

                </View>
            </View>
        )
    }

    render() {

        return (
            <View style={styles.container}>

                <AppHeaderArrow title={'reported user list'} pressArrow={() => this.props.navigation.goBack()} />

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
                            renderItem={({ item, index }) => this.renderFlatListItem(item, index)}
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
        width: "100%",
        height: "100%",
        flexDirection: "column"
    },
    indicator_wrapper: {
        width: "100%",
        height: 100,
        justifyContent: "center",
        alignItems: "center"
    },
    avatar_wrapper: {
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: Math.round(avatarWidth / 2),
        overflow: "hidden"
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
    userarea_wrapper: {
        width: avatarWidth + space1 * 2,
        flexDirection: "column",
        alignItems: "center"
    },
    useraction_wrapper: {
        marginTop: 10,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 10,
        alignItems: "center"
    },
    useraction_result: {
        marginTop: 10,
        width: "100%",
        alignItems: "center"
    },
    text_bold13blue: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13,
        color: Global.colorButtonBlue
    },
    useraction_indicator: {
        width: "100%",
        alignItems: "center"
    },
    item_username: {
        width: "100%",
        paddingHorizontal: space1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    item_reporttext_wrapper: {
        width: "100%",
        flexDirection: "row",
        marginTop: 10
    },
    item_onereporttext: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13,
        marginBottom: 10,
        textAlign: "justify"
    },
    item_bottom: {
        width: "100%",
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    text_bold13: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    item_deletereport: {
        width: 90,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Global.colorButtonBlue
    },
    item_deletetext: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 10,
        color: "white",
        lineHeight: 20
    },
    container: {
        flex: 1,
        backgroundColor: Global.colorGreen,
        alignItems: "center"
    }
});  