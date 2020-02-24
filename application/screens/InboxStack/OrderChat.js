
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-datepicker';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';

const headerImageWidth = Math.round(Global.screenWidth * 0.12);
const chatImageWidth = Math.round(Global.screenWidth * 0.14);
const colorMeBack = '#fce5e6';
const colorOtherBack = '#e9f5e6';
const chatAvatarWidth = Math.round(Global.screenWidth * 0.07);
const chatMeArrowRight = - Math.round(chatAvatarWidth * 0.50);
const chatMeArrowBottomWithOneLine = Math.round(chatAvatarWidth * 0.10);
const chatMeArrowBottomWithTwoLine = Math.round(chatAvatarWidth * 0.30);


export default class OrderChat extends Component { // "OrderChatScreen"
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            transactionid: '',

            dateBoxMin: '', // '08/23/2019'
            date: '',
            time: '',
            location: '',
            isDatePicked: false,
            isTimePicked: false,
            sendtext: '',
            loading: true,

            otheruid: '',
            otheravatar: '',
            otherusername: '',
            myuid: '',
            myavatar: '',

            me: true,
            status: 0,
            type: 1,
            pickupinfo: {},
            pictures: [],
            chathistory: [],
            lastPickupChatIndex: 0,
            firstFetch: true,
        };
    }
    componentDidMount() {
        const { params } = this.props.navigation.state;
        const transactionid = params.transactionid;
        const myuid = Fire.shared.uid;

        const now = new Date();
        const todayDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();

        Fire.shared.getMyOneOrderInfo(transactionid).then((res) => {
            this.setState({
                transactionid: transactionid,
                otheruid: res.other,
                myuid: myuid,
                dateBoxMin: todayDate, // '08/23/2019'
                me: res.me,
                status: res.status,
            })
        }).then(() => {
            let uidarray = []; uidarray.push(this.state.myuid); uidarray.push(this.state.otheruid);
            Fire.shared.getUserNamesAndAvatars(uidarray).then((res) => {
                this.setState({
                    myavatar: res[myuid].avatar,
                    otheravatar: res[this.state.otheruid].avatar,
                    otherusername: res[this.state.otheruid].username,
                })
            })
        }).then(() => {
            Fire.shared.getOneTransactionInfo(transactionid).then((res) => {
                this.setState({
                    pictures: res.pictures,
                    pickupinfo: res.pickupinfo,
                    loading: false,
                })
            }).catch((error) => Global.isDev && console.log(error))
        }).catch((error) => Global.isDev && console.log(error));


        const callbackForChat = (messages) => {
            let tempArray = Object.keys(messages.chathistory).map(time => {
                return { ...messages.chathistory[time], time: parseInt(time) }
            })
            tempArray.sort(function (x, y) {
                return x.time - y.time;
            })
            let lastPickupChatIndex = 0;
            for (let i = 0; i < tempArray.length; i++) {
                const element = tempArray[i];
                if (element.type === 1 || element.type === 2) {
                    lastPickupChatIndex = i;
                }
            }
            this.setState({
                firstFetch: false,
                chathistory: tempArray,
                lastPickupChatIndex: lastPickupChatIndex
            });
        }
        Fire.shared.getChatHistoryOneTransaction(transactionid, callbackForChat)

        const callbackForTransactionStatus = (transactionStatus) => {
            this.setState({
                status: transactionStatus.status,
            })
        }
        Fire.shared.setCallbackForTransactionStatus(transactionid, callbackForTransactionStatus)
    }

    componentWillUnmount() {
        Fire.shared.unSubscribe('orderchat');
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
    pressFlag() {
        const navigateAction = NavigationActions.navigate({
            routeName: 'ReportUserScreen',
            params: {
                transactionid: this.state.transactionid,
                from_uid: this.state.myuid,
                to_uid: this.state.otheruid,
                to_name: this.state.otherusername
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }

    pressdate() {
        this.datePicker.onPressDate();
    }

    presstime() {
        this.timePicker.onPressDate();
    }

    sendText = () => {
        const type = 4;
        Fire.shared.increaseEngagementCount();
        Fire.shared.sendText(this.state.transactionid, this.state.sendtext, this.state.me, type).then(() => {
            this.setState({
                sendtext: ''
            })
            this.refs.scrollView.scrollToEnd();
        })
    }

    pressPickup() {
        if (this.state.date === '' || this.state.time === '' || this.state.location === '') {
            return;
        }
        const pickupinfo = {
            date: this.state.date,
            time: this.state.time,
            location: this.state.location,
        }
        Fire.shared.NewProposePickup(this.state.transactionid, pickupinfo, this.state.me, this.state.otheruid).then(() => {
            this.setState({
                date: '',
                time: '',
                location: '',
                isDatePicked: false,
                isTimePicked: false,
            })
            this.refs.scrollView.scrollToEnd();
        })
    }

    renderFlatListHeader = () => {
        if (this.state.status > 3) {
            return null;
        }
        const pictures = this.state.pictures;
        let pickupimages = [];
        for (let i = 0; i < pictures.length; i++) {
            pickupimages.push(
                <Image key={i}
                    source={{ uri: pictures[i] }}
                    style={styles.storeimages}
                    resizeMode='contain' />
            )
        }

        let location = '', date = '', time = '';
        if (this.state.status === 2) {
            location = this.state.chathistory[this.state.lastPickupChatIndex].info.location || '';
            date = this.state.chathistory[this.state.lastPickupChatIndex].info.date || '';
            time = this.state.chathistory[this.state.lastPickupChatIndex].info.time || '';
        }

        return (
            <View style={styles.chat_header_wrapper}>
                {pickupimages}
                {this.state.status < 2 &&
                    <View style={styles.chat_header_pickup}>
                        <Text style={styles.text_black14}>pickup</Text>
                        <Text style={styles.text_black14}>pending</Text>
                    </View>
                }
                {this.state.status === 2 &&
                    <View style={styles.chat_header_pickup}>

                        <Text style={styles.text_black14}>{location}</Text>
                        <Text style={styles.text_black14}>{date}</Text>
                        <Text style={styles.text_black14}>{time}</Text>
                    </View>
                }
            </View>
        )
    }

    renderFlatListFooter = () => {
        const lastChatObj = this.state.chathistory[this.state.chathistory.length - 1];

        if (lastChatObj.type === 0) {
            const username = (this.state.me === lastChatObj.who) ? 'you' : '@' + this.state.otherusername;
            return (
                <View style={styles.chat_footer}>
                    <Text style={styles.text_bold14}>{username} declined the pickup,</Text>
                    <Text style={styles.text_bold14}>propose a new one!</Text>
                </View>
            )

        } else if (lastChatObj.type === 1) {
            const username = (this.state.me === lastChatObj.who) ? '@' + this.state.otherusername : 'you';
            return (
                <View style={styles.chat_footer}>
                    <Text style={styles.text_bold14}>wait to see if {username}</Text>
                    <Text style={styles.text_bold14}>accepts!</Text>
                </View>
            )
        } else if (lastChatObj.type === 2) {
            const username = (this.state.me === lastChatObj.who) ? '@' + this.state.otherusername : 'you';
            return (
                <View style={styles.chat_footer}>
                    <Text style={styles.text_bold14}>wait to see if {username}</Text>
                    <Text style={styles.text_bold14}>accepts!</Text>
                </View>
            )
        } else if (lastChatObj.type === 3) {
            return (
                <View style={styles.chat_footer}>
                    <Text style={styles.text_bold14}>pickup confirmed!</Text>
                    <Text style={styles.text_black14}>{this.state.chathistory[this.state.lastPickupChatIndex].info.location}</Text>
                    <Text style={styles.text_black14}>{this.state.chathistory[this.state.lastPickupChatIndex].info.date}</Text>
                    <Text style={styles.text_black14}>{this.state.chathistory[this.state.lastPickupChatIndex].info.time}</Text>
                </View>
            )
        } else {
            return (
                <View>
                </View>
            )
        }
    }


    pressAcceptDecline(isAccept) { // 3:accept, 1:decline
        const date = this.state.chathistory[this.state.lastPickupChatIndex].info.date || '';
        const time = this.state.chathistory[this.state.lastPickupChatIndex].info.time || '';
        let pickupDate = new Date();
        pickupDate.setFullYear(parseInt(date.substring(6, 10)));
        pickupDate.setMonth(parseInt(date.substring(0, 2) - 1));
        pickupDate.setDate(parseInt(date.substring(3, 5)));
        pickupDate.setHours(parseInt(time.substring(0, 2)));
        pickupDate.setMinutes(parseInt(time.substring(3, 5)));
        const pickupTimeStamp = pickupDate.getTime();
        const pickupTimeStampUTC = pickupTimeStamp + (4 * 60 * 60 * 1000);
        Fire.shared.setPickupAcceptAndDecline(this.state.transactionid, isAccept, this.state.me, this.state.otheruid, pickupTimeStampUTC);
    }

    renderFlatListItem(item, index) {
        let itemtext = '', itemsubtext = '';
        if (item.type === 0) {
            return;
        } else if (item.type === 1) {
            itemtext = ' proposed a pickup';
            const date = item.info.date.substring(0, 5);
            itemsubtext = item.info.location + ', ' + date + ', ' + item.info.time;
        } else if (item.type === 2) {
            itemtext = ' proposed a new pickup';
            const date = item.info.date.substring(0, 5);
            itemsubtext = item.info.location + ', ' + date + ', ' + item.info.time;
        } else if (item.type === 3) {
            itemtext = ' accepted the pickup!';
        } else if (item.type === 4) {
            itemsubtext = item.info;
        } else {
            return;
        }

        const isOneLine = itemtext === '' || itemsubtext === '';

        if (this.state.me === item.who) {
            return (
                <View style={styles.chatitem_me_wrapper}>
                    <View style={styles.chatitem_me_subwrapper}>
                        {itemtext !== '' && <Text style={styles.text_bold12}>you{itemtext}</Text>}
                        {itemsubtext !== '' && <Text style={styles.text_regular10}>{itemsubtext}</Text>}
                        <Image
                            source={require('@images/chatMeArrow.png')}
                            style={{ position: 'absolute', right: chatMeArrowRight, bottom: isOneLine ? chatMeArrowBottomWithOneLine : chatMeArrowBottomWithTwoLine, width: chatAvatarWidth, height: chatAvatarWidth }}
                            resizeMode='contain' />
                        <View style={styles.chatitem_me_avatarwrapper}>
                            <Image
                                source={{ uri: this.state.myavatar }}
                                style={styles.chatitem_avatar}
                                resizeMode='contain' />
                        </View>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={styles.chatitem_other_wrapper}>
                    <View style={[styles.chatitem_other_subwrapper, { width: ((item.type === 1 || item.type === 2)) && (index === this.state.lastPickupChatIndex) && (this.state.status === 1) ? '90%' : '80%' }]}>
                        {itemtext !== '' &&
                            <Text style={styles.text_bold12}>@{this.state.otherusername}{itemtext}</Text>
                        }
                        {itemsubtext !== '' &&
                            <View style={styles.item_subtext_wrapper}>
                                <Text style={styles.text_regular10}>{itemsubtext}</Text>
                                {((item.type === 1 || item.type === 2)) && (index === this.state.lastPickupChatIndex) && (this.state.status === 1) &&
                                    <TouchableOpacity onPress={this.pressAcceptDecline.bind(this, true)} style={styles.acceptdecline_textwrapper}>
                                        <Text style={styles.text_acceptdecline}>accept</Text>
                                    </TouchableOpacity>
                                }
                                {((item.type === 1 || item.type === 2)) && (index === this.state.lastPickupChatIndex) && (this.state.status === 1) &&
                                    <TouchableOpacity onPress={this.pressAcceptDecline.bind(this, false)} style={styles.acceptdecline_textwrapper}>
                                        <Text style={styles.text_acceptdecline}>decline</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        }
                        <Image
                            source={require('@images/chatOtherArrow.png')}
                            style={{ position: 'absolute', left: chatMeArrowRight, bottom: isOneLine ? chatMeArrowBottomWithOneLine : chatMeArrowBottomWithTwoLine, width: chatAvatarWidth, height: chatAvatarWidth }}
                            resizeMode='contain' />
                        <View style={styles.chatitem_other_avatarwrapper}>
                            <Image
                                source={{ uri: this.state.otheravatar }}
                                style={styles.chatitem_avatar}
                                resizeMode='contain' />
                        </View>
                    </View>
                </View>
            )
        }
    }
    pressUser() {
        const uid = this.state.otheruid
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'OrderChatScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }

    render() {

        if (this.state.loading) {
            return (
                <View style={styles.indicator_wrapper}>
                    <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                </View>
            )
        }
        let date, time = '';
        if (this.state.isDatePicked) {
            date = this.state.date.substring(0, 2) + '.' + this.state.date.substring(3, 5);
        }
        if (this.state.isTimePicked) {
            const hour = parseInt(this.state.time.substring(0, 2));
            if (hour > 12) {
                time = (hour - 12).toString() + ':' + this.state.time.substring(3, 5) + ' pm';
            } else {
                time = hour.toString() + ':' + this.state.time.substring(3, 5) + ' am';
            }
        }

        return (

            <KeyboardAwareScrollView contentContainerStyle={styles.container} scrollEnabled={false}>

                {/* hearder */}
                <View style={styles.header_wrapper}>

                    <View style={styles.arrowflag_wrapper}>
                        <TouchableOpacity
                            onPress={this.pressLeftArrow.bind(this)}>
                            <Image
                                source={require('@images/leftarrow.png')}
                                style={{ width: Global.HeaderArrowWidth }}
                                resizeMode='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.flag_wrapper} onPress={this.pressFlag.bind(this)} >
                            <SimpleLineIcons name="flag" size={25} color={'black'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.header_userwrapper}>
                        <TouchableOpacity onPress={this.pressUser.bind(this)} style={styles.header_avatarwrapper}>
                            <Image
                                source={{ uri: this.state.otheravatar }}
                                style={styles.header_avatar}
                                resizeMode='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.pressUser.bind(this)}>
                            <Text style={styles.header_username}>@{this.state.otherusername}</Text>
                        </TouchableOpacity>
                    </View>
                </View>



                <ScrollView ref="scrollView" style={styles.chat_area} contentContainerStyle={{ alignItems: 'center' }}>

                    <View style={styles.chat_container}>
                        <FlatList
                            data={this.state.chathistory}
                            extraData={this.state}
                            renderItem={({ item, index }) => this.renderFlatListItem(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                            ListHeaderComponent={this.renderFlatListHeader}
                            ListFooterComponent={this.renderFlatListFooter}
                        />
                        <View style={{ height: 30 }}></View>
                    </View>

                </ScrollView>



                {/* // 0:pickup proposed, 1:pickup declined, 2:new pickup proposed, 3:accepted, 4: general */}
                <View style={styles.pickupform_wrapper}>

                    {/* type here */}
                    <View style={styles.typehere_wrapper}>
                        <TextInput maxLength={Global.TM100} style={styles.typehere_input} autoCapitalize='none' multiline={false} placeholder='type here...' placeholderTextColor='black' onChangeText={(text) => this.setState({ sendtext: text })} value={this.state.sendtext} returnKeyType="send" onSubmitEditing={this.sendText}></TextInput>

                    </View>

                    {/* date, time, location */}
                    {this.state.status !== 3 &&
                        <View style={styles.pickupform}>

                            <TouchableOpacity style={styles.pickup_datewrapper} onPress={this.pressdate.bind(this)}>

                                <Text style={styles.text_black12}>{this.state.isDatePicked ? date : 'date'} </Text>
                                <View style={{ top: -4 }}>
                                    <FontAwesome name="sort-down" size={12} color={'black'} />
                                </View>
                            </TouchableOpacity>

                            <DatePicker
                                style={{ width: 0, height: 0 }}
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
                                onDateChange={(date) => { this.setState({ date: date, isDatePicked: true }) }}
                            />
                            <DatePicker
                                style={{ width: 0, height: 0 }}
                                date={this.state.time}
                                mode="time"
                                showIcon={false}
                                hideText
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                // is24Hour
                                ref={(control) => this.timePicker = control}
                                onDateChange={(time) => { this.setState({ time: time, isTimePicked: true }) }}
                            />

                            <TouchableOpacity style={styles.pickup_timewrapper} onPress={this.presstime.bind(this)}>

                                <Text style={styles.text_black12}>{this.state.isTimePicked ? time : 'time'} </Text>
                                <View style={{ top: -4 }}>
                                    <FontAwesome name="sort-down" size={12} color={'black'} />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.pickup_locationwrapper}>
                                <TextInput maxLength={Global.TM20} autoCapitalize='sentences' multiline={false} style={styles.pickup_locationinput} placeholder='location' placeholderTextColor='black' onChangeText={(text) => this.setState({ location: text })} value={this.state.location} ></TextInput>
                            </View>

                        </View>
                    }

                    {/* propose pickup button */}
                    {this.state.status < 3 &&
                        <View style={styles.pickup_btnwrapper}>
                            <TouchableOpacity style={styles.pickup_btn} onPress={this.pressPickup.bind(this)} >
                                <Text style={styles.pickup_btntext}>propose pickup</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>

                <View style={{ height: Global.TabBarHeight }}></View>

            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        backgroundColor: "white",
        alignItems: "center"
    },
    header_wrapper: {
        flexDirection: "column",
        width: "100%",
        height: Math.round(Global.screenWidth * 0.25),
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    arrowflag_wrapper: {
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    flag_wrapper: {
        bottom: -10,
        left: -10
    },
    header_userwrapper: {
        flex: 0.7,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        top: -5
    },
    header_avatarwrapper: {
        width: headerImageWidth,
        height: headerImageWidth,
        borderRadius: Math.round(headerImageWidth / 2),
        overflow: "hidden"
    },
    header_avatar: {
        width: "100%",
        height: "100%"
    },
    header_username: {
        marginLeft: 10,
        fontFamily: Global.Nimbus_Black,
        fontSize: 14,
        color: "black"
    },
    chat_area: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    chat_container: {
        width: "90%",
        flexDirection: "column"
    },
    chatitem_me_wrapper: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: chatAvatarWidth * 1.5,
        paddingBottom: Math.round(chatAvatarWidth * 0.4)
    },
    chatitem_other_wrapper: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingLeft: chatAvatarWidth * 1.5,
        paddingBottom: Math.round(chatAvatarWidth * 0.4)
    },
    chatitem_me_subwrapper: {
        width: "80%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: 10,
        backgroundColor: colorMeBack,
        borderRadius: 15
    },
    chatitem_other_subwrapper: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 10,
        backgroundColor: colorOtherBack,
        borderRadius: 15
    },
    text_bold12: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 12
    },
    text_regular10: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 10
    },
    text_acceptdecline: {
        top: Platform.OS === "ios" ? 3 : 0,
        fontFamily: Global.Nimbus_Bold,
        fontSize: 10,
        color: "white"
    },
    acceptdecline_textwrapper: {
        marginLeft: 10,
        paddingVertical: 2,
        paddingHorizontal: 5,
        backgroundColor: Global.colorButtonBlue
    },
    chatitem_other_avatarwrapper: {
        position: "absolute",
        left: -(chatAvatarWidth * 1.5),
        bottom: -Math.round(chatAvatarWidth * 0.34),
        width: chatAvatarWidth,
        height: chatAvatarWidth,
        borderRadius: Math.round(chatAvatarWidth / 2),
        overflow: "hidden"
    },
    indicator_wrapper: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    chatitem_me_avatarwrapper: {
        position: "absolute",
        right: -(chatAvatarWidth * 1.5),
        bottom: -Math.round(chatAvatarWidth * 0.34),
        width: chatAvatarWidth,
        height: chatAvatarWidth,
        borderRadius: Math.round(chatAvatarWidth / 2),
        overflow: "hidden"
    },
    chatitem_avatar: {
        width: "100%",
        height: "100%"
    },
    pickupform_wrapper: {
        width: "90%",
        marginTop: 15
    },
    typehere_wrapper: {
        height: Global.screenWidth * 0.07,
        borderBottomColor: "black",
        borderBottomWidth: 1,
        justifyContent: "flex-end"
    },
    typehere_input: {
        width: "100%",
        fontFamily: Global.Nimbus_Black,
        fontWeight: "normal",
        fontSize: 12,
        paddingLeft: 5
    },
    pickupform: {
        height: Global.screenWidth * 0.07,
        width: "100%",
        flexDirection: "row",
        alignItems: "center"
    },
    pickup_datewrapper: {
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    text_black12: {
        color: "black",
        fontFamily: Global.Nimbus_Black,
        fontSize: 12
    },
    pickup_timewrapper: {
        flex: 0.35,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    pickup_locationwrapper: {
        flex: 0.35,
        alignItems: "flex-end"
    },
    pickup_locationinput: {
        width: "80%",
        fontFamily: Global.Nimbus_Black,
        fontSize: 12,
        fontWeight: "normal",
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    pickup_btnwrapper: {
        height: Global.screenWidth * 0.08,
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 10
    },
    pickup_btn: {
        width: "35%",
        height: "70%",
        backgroundColor: Global.colorButtonBlue,
        justifyContent: "center",
        alignItems: "center"
    },
    pickup_btntext: {
        lineHeight: Math.round(Global.screenWidth * 0.056),
        fontFamily: Global.Nimbus_Bold,
        fontSize: 12,
        color: "white"
    },
    storeimages: {
        width: chatImageWidth,
        height: chatImageWidth,
        marginLeft: 5
    },
    chat_header_wrapper: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10
    },
    chat_header_pickup: {
        marginLeft: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    text_black14: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 14
    },
    chat_footer: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    text_bold14: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 14
    },
    item_subtext_wrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});