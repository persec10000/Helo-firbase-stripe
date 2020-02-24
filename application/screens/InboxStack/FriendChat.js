
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SimpleLineIcons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const headerImageWidth = Math.round(Global.screenWidth * 0.12);
const colorMeBack = '#fce5e6';
const colorOtherBack = '#e9f5e6';
const chatAvatarWidth = Math.round(Global.screenWidth * 0.07);
const chatMeArrowRight = - Math.round(chatAvatarWidth * 0.50);
const chatMeArrowBottomWithOneLine = Math.round(chatAvatarWidth * 0.10);


export default class FriendChat extends Component { // "FriendChatScreen"
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {

            sendtext: '',
            loading: true,

            otheruid: '',
            otheravatar: '',
            otherusername: '',
            myuid: '',
            myavatar: '',

            inboxName: '',
            chathistory: [],
        };
    }
    componentDidMount() {
        const { params } = this.props.navigation.state;
        const myuid = Fire.shared.uid;
        const otheruid = params.uid;
        let uidarray = []; uidarray.push(myuid); uidarray.push(otheruid);
        let inboxName = '';
        if (myuid > otheruid) {
            inboxName = otheruid + myuid;
        } else {
            inboxName = myuid + otheruid;
        }

        Fire.shared.getUserNamesAndAvatars(uidarray).then((res) => {
            this.setState({
                myuid: myuid,
                otheruid: otheruid,
                myavatar: res[myuid].avatar,
                otheravatar: res[otheruid].avatar,
                otherusername: res[otheruid].username,
                inboxName: inboxName,
            })
        })

        const callbackForChat = (messages) => {
            if (isEmpty(messages) || isEmpty(messages.chathistory)) {
                return;
            }
            let tempArray = Object.keys(messages.chathistory).map(time => {
                return { ...messages.chathistory[time], time: parseInt(time) }
            })
            tempArray.sort(function (x, y) {
                return x.time - y.time;
            })
            this.setState({
                chathistory: tempArray,
            });
        }
        Fire.shared.getChatHistoryOneFriend(inboxName, callbackForChat)
        this.setState({ loading: false })
    }
    componentWillUnmount() {
        Fire.shared.unSubscribe('friendchat');
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
                transactionid: '',
                from_uid: this.state.myuid,
                to_uid: this.state.otheruid,
                to_name: this.state.otherusername
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }


    sendTextToFriend = () => {
        Fire.shared.increaseEngagementCount();
        Fire.shared.sendTextToFriend(this.state.inboxName, this.state.sendtext, this.state.otheruid)
        this.setState({
            sendtext: ''
        })
        this.refs.scrollView.scrollToEnd();
    }


    renderFlatListItem(item, index) {
        if (isEmpty(this.state.myavatar) || isEmpty(this.state.otheravatar)) return;

        const itemsubtext = item.info;

        if (item.uid === this.state.myuid) {
            return (
                <View style={styles.chatitem_me_wrapper}>
                    <View style={styles.chatitem_me_subwrapper}>
                        {itemsubtext !== '' && <Text style={styles.text_regular10}>{itemsubtext}</Text>}
                        <Image
                            source={require('@images/chatMeArrow.png')}
                            style={styles.chatitem_me_arrow}
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
                    <View style={styles.chatitem_other_subwrapper}>
                        {itemsubtext !== '' &&
                            <Text style={styles.text_regular10}>{itemsubtext}</Text>
                        }
                        <Image
                            source={require('@images/chatOtherArrow.png')}
                            style={styles.chatitem_other_arrow}
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

    renderFlatListHeader() {
        return (
            <View style={styles.flatlistheader}></View>
        )
    }
    pressUser() {
        const uid = this.state.otheruid
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'FriendChatScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={styles.indicator}>
                    <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                </View>
            )
        }

        const otheravatar = this.state.otheravatar ? { uri: this.state.otheravatar } : require('@images/avatar.png');

        return (
            <KeyboardAwareScrollView contentContainerStyle={styles.container} scrollEnabled={false}>

                {/* hearder */}
                <View style={styles.header_wrapper}>

                    <View style={styles.topicons_wrapper}>
                        <TouchableOpacity
                            onPress={this.pressLeftArrow.bind(this)}>
                            <Image
                                source={require('@images/leftarrow.png')}
                                style={styles.headerarrow}
                                resizeMode='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.flag_wrapper} onPress={this.pressFlag.bind(this)} >
                            <SimpleLineIcons name="flag" size={25} color={'black'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headercenter_wrapper}>
                        <TouchableOpacity onPress={this.pressUser.bind(this)} style={styles.headeravatar_wrapper}>
                            <Image
                                source={otheravatar}
                                style={styles.headeravatar}
                                resizeMode='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.pressUser.bind(this)}>
                            <Text style={styles.header_username}>@{this.state.otherusername}</Text>
                        </TouchableOpacity>

                    </View>
                </View>


                <ScrollView ref="scrollView" style={styles.main_container}>

                    <FlatList
                        data={this.state.chathistory}
                        extraData={this.state}
                        renderItem={({ item, index }) => this.renderFlatListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={this.renderFlatListHeader}
                    />
                </ScrollView>


                <View style={styles.typehere_container}>
                    {/* type here */}
                    <View style={styles.typehere_wrapper}>
                        <TextInput maxLength={Global.TM500} style={styles.typehere_input} autoCapitalize='none' multiline={false} placeholder='type here...' placeholderTextColor='black' onChangeText={(text) => this.setState({ sendtext: text })} value={this.state.sendtext} returnKeyType="send" onSubmitEditing={this.sendTextToFriend}></TextInput>
                    </View>
                </View>

                <View style={{ height: Global.TabBarHeight }}></View>

            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    chatitem_me_wrapper: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        paddingBottom: Math.round(chatAvatarWidth * 0.4),
        paddingRight: chatAvatarWidth * 1.5,
        justifyContent: "flex-end"
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
    chatitem_other_wrapper: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        paddingBottom: Math.round(chatAvatarWidth * 0.4),
        paddingLeft: chatAvatarWidth * 1.5,
        justifyContent: "flex-start"
    },
    chatitem_other_subwrapper: {
        width: "80%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 10,
        backgroundColor: colorOtherBack,
        borderRadius: 15
    },
    text_regular10: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 10
    },
    chatitem_me_arrow: {
        position: "absolute",
        right: chatMeArrowRight,
        bottom: chatMeArrowBottomWithOneLine,
        width: chatAvatarWidth,
        height: chatAvatarWidth
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
    chatitem_other_arrow: {
        position: "absolute",
        left: chatMeArrowRight,
        bottom: chatMeArrowBottomWithOneLine,
        width: chatAvatarWidth,
        height: chatAvatarWidth
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
    flatlistheader: {
        height: Math.round(chatAvatarWidth / 2)
    },
    indicator: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
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
        height: Global.screenWidth * 0.25,
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    topicons_wrapper: {
        flex: 0.3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    headerarrow: {
        width: Global.HeaderArrowWidth
    },
    flag_wrapper: {
        bottom: -10,
        left: -10
    },
    headercenter_wrapper: {
        flex: 0.7,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        top: -5
    },
    headeravatar_wrapper: {
        width: headerImageWidth,
        height: headerImageWidth,
        borderRadius: Math.round(headerImageWidth / 2),
        overflow: "hidden"
    },
    headeravatar: {
        width: "100%",
        height: "100%"
    },
    header_username: {
        marginLeft: 10,
        fontFamily: Global.Nimbus_Black,
        fontSize: 14,
        color: "black"
    },
    main_container: {
        flex: 1,
        width: "100%",
        maxHeight: "100%",
        flexDirection: "column"
    },
    typehere_container: {
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
    }
});