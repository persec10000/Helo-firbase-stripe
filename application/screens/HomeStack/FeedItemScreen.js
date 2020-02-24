
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, StyleSheet, TextInput, FlatList, Share, Linking, ActivityIndicator } from 'react-native';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Entypo, MaterialIcons, AntDesign, Octicons } from '@expo/vector-icons';

import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const imageWidth = Math.round(Global.screenWidth * 0.9);
const iconWidth = Math.round(Global.screenWidth * 0.05);
const commentTrianglePaddingLeft = 20 + Math.round(iconWidth / 4);
const likeTrianglePaddingLeft = 40 + Math.round(iconWidth / 4) + iconWidth;
const shareTrianglePaddingLeft = 60 + Math.round(iconWidth / 4) + iconWidth + iconWidth;
const modalItemHeight = 75;


class Carousel extends Component {
    render() {
        const { images } = this.props;
        if (images && images.length) {
            let imageGroup = [];
            for (let i = 0; i < images.length; i++) {
                if (images.length > 1) {
                    let dotgroup = [];
                    for (let j = 0; j < images.length; j++) {
                        dotgroup.push(
                            <View key={`${i}${j}`} style={{ marginRight: 10 }}>
                                <Octicons name="primitive-dot" size={20} color={i === j ? 'white' : 'gray'} />
                            </View>
                        )
                    }
                    imageGroup.push(
                        <View key={i}>
                            <Image style={{ width: imageWidth, height: imageWidth }} source={{ uri: images[i] }} />
                            <View style={{ position: 'absolute', alignSelf: 'center', bottom: 10, flexDirection: 'row' }}>
                                {dotgroup}
                            </View>
                        </View>
                    );
                } else {
                    imageGroup.push(
                        <View key={i}>
                            <Image style={{ width: imageWidth, height: imageWidth }} source={{ uri: images[i] }} />
                        </View>
                    );
                }

            }
            return (
                <View style={{ height: imageWidth }} >
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={true} >
                        {imageGroup}
                    </ScrollView>
                </View>
            );
        }

        return null;
    }
}



class FeedItemScreen extends Component { //'FeedItemScreen'
    static navigationOptions = ({ navigation }) => ({
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            isMyPost: false,
            isAdmin: false,
            feedItem: {},
            modalVisible: false,
            feedUsername: '',
            mycomment: '',
            isCommentSending: false,
            commentList: [], // time, uid, username, text
            iconIndex: 1, // 0~4 0:no 1~3:comment,like,share
            showLikeSection: false,
            liked: false,
            likeUserList: [], // uid, username
            myInfo: {
                uid: '',
                username: '',
            },
            loading: true,
        };
        Fire.shared.checkAdmin().then((result) => {
            if (result) {
                this.setState({
                    isAdmin: true,
                })
            }
        })
    }

    componentWillReceiveProps(props) {
        if (props.isFocused) {
            this.setState({ loading: true });
            const { params } = this.props.navigation.state;
            if (!params) {
                this.setState({ loading: false });
                return;
            }
            // if (!params || !params.item) {
            //     return
            // }
            if (params.back) {
                this.setState({ loading: false });
                return;
            };

            const feedItem = params.item || {};
            // uidarray, get usernames
            const comments = feedItem.comment || {};
            const likeusers = feedItem.like || [];
            let uidarray = [];
            Object.values(comments).map((timestamp) => {
                if (!uidarray.includes(timestamp.uid)) {
                    uidarray.push(timestamp.uid)
                }
            })
            likeusers.map((item) => {
                if (!uidarray.includes(item)) {
                    uidarray.push(item)
                }
            })
            const myuid = Fire.shared.uid;
            if (myuid === feedItem.uid) {
                this.setState({ isMyPost: true });
            } else {
                this.setState({ isMyPost: false });
            }
            if (!uidarray.includes(myuid)) {
                uidarray.push(myuid)
            }
            if (!uidarray.includes(feedItem.uid)) {
                uidarray.push(feedItem.uid)
            }

            Fire.shared.getUserNames(uidarray).then((res) => { // { uid : username }
                return res;
            }).then((res) => {
                // comments init
                const timestampArray = Object.keys(comments);
                let commentObjArray = [];
                for (let i = 0; i < timestampArray.length; i++) {
                    const timestamp = timestampArray[i];
                    const uid = comments[timestamp].uid;
                    commentObjArray.push({
                        time: timestamp,
                        username: res[uid],
                        ...comments[timestamp]
                    })
                }
                commentObjArray.sort(function (x, y) {
                    return x.time - y.time;
                })

                // likeusers init
                let likeUserArray = [];
                for (let i = 0; i < likeusers.length; i++) { // 
                    if (likeusers[i] === myuid) {
                        this.setState({ liked: true });
                    }
                    likeUserArray.push({
                        uid: likeusers[i],
                        username: res[likeusers[i]] // likeusers[i]:uid
                    })
                }
                this.setState({
                    myInfo: {
                        uid: myuid,
                        username: res[myuid],
                    },
                    feedUsername: res[feedItem.uid],
                    commentList: commentObjArray, // time, text, uid, username
                    likeUserList: likeUserArray, // uid, username
                    feedItem: feedItem,
                    loading: false,
                })

            }).catch((err) => Global.isDev && console.log(err))
        }
    }

    componentWillUnmount() {
        this.setState({ modalVisible: false })
    }

    pressEditAndDelete(index) { // 1:edit, 2:delete
        this.setState({ modalVisible: false });
        if (index === 1) {
            const navigateAction = NavigationActions.navigate({
                routeName: 'SellScreen',
                params: {
                    from: 'FeedItemScreen',
                    feedItem: this.state.feedItem,
                }
            });
            this.props.navigation.dispatch(navigateAction);
        } else if (index === 2) {
            Fire.shared.deletePost(this.state.feedItem.postid).then(() => {
                this.props.navigation.goBack();
                Toast.show({ text: Strings.ST31, position: 'bottom', duration: Global.ToastDuration })
            }).catch((err) => Global.isDev && console.log(err))
        }
    }

    pressBuy() {
        if (isEmpty(this.state.feedItem)) return;
        const checkoutObj = {
            picture: this.state.feedItem.picture[0],
            title: this.state.feedItem.title,
            category: this.state.feedItem.category,
            size: this.state.feedItem.size,
            brand: this.state.feedItem.brand, // for book
            selleruid: this.state.feedItem.uid,
            sellerusername: this.state.feedUsername,
            price: this.state.feedItem.price,
            postid: this.state.feedItem.postid,
        }
        const { params } = this.props.navigation.state;
        let checkoutObjs = (params && params.checkoutObjs) ? params.checkoutObjs : [];
        checkoutObjs.push(checkoutObj);
        const navigateAction = NavigationActions.navigate({
            routeName: 'CheckoutScreen',
            params: {
                from: 'FeedItemScreen',
                checkoutObjs,
            },
        });
        this.props.navigation.dispatch(navigateAction);
    }


    pressIcons(index) { // 1~3: comment, like, share
        if (index === 1) {
            if (this.state.iconIndex === 1) {
                this.setState({
                    iconIndex: 0
                })
            } else {
                this.setState({
                    iconIndex: 1
                });
            }
            this.setState({
                showLikeSection: false
            })
        } else if (index === 2) {
            if (!this.state.liked) {
                let likelist = this.state.feedItem.like || []; // uids
                likelist.push(this.state.myInfo.uid);
                Fire.shared.setMyLike(this.state.feedItem.postid, likelist);
                Fire.shared.increaseEngagementCount();

                const likeNotificationObj = {
                    type: 1,
                    username: this.state.myInfo.username,
                    picture: this.state.feedItem.picture[0],
                }
                Fire.shared.setNotification(this.state.feedItem.uid, likeNotificationObj);

                let stateLikelist = this.state.likeUserList;
                stateLikelist.push({
                    uid: this.state.myInfo.uid,
                    username: this.state.myInfo.username,
                })
                this.setState({
                    liked: !this.state.liked,
                    likeUserList: stateLikelist, // uid, username
                })
            } else {
                this.setState({
                    iconIndex: 2,
                    showLikeSection: true
                })
            }
        } else if (index === 3) {
            this.setState({
                iconIndex: 3,
                showLikeSection: false
            });
            this.shareOnSocial();
        }
    }

    async shareOnSocial() {
        const remoteURL = this.state.feedItem.picture[0];
        const downloadPath = FileSystem.cacheDirectory + 'sharefile.jpg';
        const { uri: localUrl } = await FileSystem.downloadAsync(remoteURL, downloadPath);
        Sharing.shareAsync(localUrl, {
            mimeType: 'image/jpeg',     // Android
            dialogTitle: 'sharing...',  // Android and Web
            UTI: 'image/jpeg',          // iOS
        });
    }


    pressArrow() {
        const { params } = this.props.navigation.state;
        if (params && params.from) {
            if (params.from === 'OtherProfileScreen') {
                this.props.navigation.goBack();
                return;
            }
            const navigateAction = NavigationActions.navigate({
                routeName: params.from,
                params: {
                    from: 'FeedItemScreen',
                },
            });
            this.props.navigation.dispatch(navigateAction);

        } else {
            this.props.navigation.goBack();
        }
    }

    sendComment() {
        if (this.state.mycomment === '') return;
        this.setState({
            isCommentSending: true,
        })

        const commentNotificationObj = {
            type: 2,
            username: this.state.myInfo.username,
            picture: this.state.feedItem.picture[0],
            comment: this.state.mycomment,
        }
        Fire.shared.setNotification(this.state.feedItem.uid, commentNotificationObj);
        Fire.shared.increaseEngagementCount();
        Fire.shared.sendComment(this.state.mycomment, this.state.feedItem.postid).then(() => {
            let commentsarraytemp = this.state.commentList;
            commentsarraytemp.push({
                uid: this.state.myInfo.uid,
                text: this.state.mycomment,
                username: this.state.myInfo.username,
            })
            this.setState({
                commentList: commentsarraytemp,
                isCommentSending: false,
                mycomment: '',
            })
            this.refs.scrollView.scrollToEnd();
        }).catch((err) => Global.isDev && console.log(err))
    }
    pressUser(uid) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'FeedItemScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    renderCommentItem(item) {
        if (item.username === '') return;
        return (
            <View style={styles.commentitem_wrapper}>
                <TouchableOpacity onPress={this.pressUser.bind(this, item.uid)}>
                    <Text style={styles.text_black12}>@{item.username}: </Text>
                </TouchableOpacity>
                <Text style={styles.commentitem_text}>{item.text}</Text>
            </View>
        )
    }

    renderLikeUsers() {
        let textWholeLikeUsers = '';
        for (let i = 0; i < this.state.likeUserList.length; i++) {
            const like_username = this.state.likeUserList[i].username;
            if (like_username !== '') {
                if (i === 0) {
                    textWholeLikeUsers = '@' + like_username;
                } else {
                    if (i === 1 && this.state.likeUserList[0].username === '') {
                        textWholeLikeUsers = '@' + like_username;
                    } else {
                        textWholeLikeUsers = textWholeLikeUsers + ', @' + like_username;
                    }
                }
            }
        }
        return (
            <View style={styles.likeuserlist_wrapper}>
                <Text style={styles.text_black12}>{textWholeLikeUsers}</Text>
            </View>
        );
    }

    pressUsername() {
        if (this.state.isMyPost) return;
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'FeedItemScreen',
                uid: this.state.feedItem.uid,
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

        const { category, picture, title, price, size, description, brand } = this.state.feedItem;

        const commenticon = this.state.iconIndex === 1 ? require('@images/comment_click.png') : require('@images/comment.png');
        const likeicon = this.state.liked ? require('@images/like_click.png') : require('@images/like.png');
        const shareicon = this.state.iconIndex === 3 ? require('@images/share_click.png') : require('@images/share.png');
        const TrianglePaddingLeft = this.state.iconIndex === 3 ? shareTrianglePaddingLeft : (this.state.iconIndex === 2 ? likeTrianglePaddingLeft : commentTrianglePaddingLeft);

        const likeCount = this.state.likeUserList.length;

        // for clothes's size, book's classcode
        let subTextTitle = '', subTextContent = '', hasSubText = false;
        if (category === 1) {
            hasSubText = true;
            subTextTitle = 'size ';
            subTextContent = size > 0 ? Global.sizeSet[size - 1] : '';
        } else if (category === 4) {
            hasSubText = true;
            subTextTitle = 'classcode ';
            subTextContent = brand;
        }

        const istypingComment = this.state.mycomment === '' ? false : true;

        return (
            <KeyboardAwareScrollView contentContainerStyle={styles.container} scrollEnabled={false} >

                {/* arrow */}
                <View style={styles.arrowbtn_wrapper}>
                    <TouchableOpacity style={styles.arrowbtn} onPress={this.pressArrow.bind(this)}>
                        <Image
                            source={require('@images/leftarrow.png')}
                            style={{ width: Global.HeaderArrowWidth }}
                            resizeMode='contain' />
                    </TouchableOpacity>
                </View>

                {/* dot */}
                <View style={styles.dots_wrapper}>
                    {(this.state.isMyPost || this.state.isAdmin) &&
                        <TouchableOpacity onPress={() => this.setState({ modalVisible: true })} style={{ marginRight: 15 }}>
                            <Entypo name="dots-three-horizontal" size={25} color={'black'} />
                        </TouchableOpacity>
                    }
                </View>

                <Modal
                    visible={this.state.modalVisible}
                    animationType={"slide"}
                    onRequestClose={() => { this.state.modalVisible(false); }}
                    transparent >

                    <TouchableOpacity onPress={() => { this.setState({ modalVisible: false }) }} style={styles.modal_container}>

                        <View style={[styles.modal_wrapper, { height: this.state.isMyPost ? modalItemHeight * 2 : modalItemHeight }]}>
                            {this.state.isMyPost &&
                                <TouchableOpacity onPress={this.pressEditAndDelete.bind(this, 1)} style={styles.modal_item}>
                                    <Text style={styles.text_black20}>edit post</Text>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity onPress={this.pressEditAndDelete.bind(this, 2)} style={[styles.modal_item, { borderTopColor: 'gray', borderTopWidth: 0.5 }]}>
                                <Text style={styles.text_black20}>delete post</Text>
                            </TouchableOpacity>
                        </View>

                    </TouchableOpacity>

                </Modal>


                <ScrollView ref="scrollView" style={styles.main_container} contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={styles.main_wrapper}>

                        <Carousel images={picture} />

                        <View style={styles.titleprice_wrapper}>
                            <Text style={styles.text_black16}>{title}</Text>
                            <Text style={styles.text_black16}>${price}</Text>
                        </View>

                        {hasSubText &&
                            <View style={styles.subtext_wrapper}>
                                <Text style={styles.text_regular13}>{subTextTitle}</Text>
                                <Text style={styles.text_black14}>{subTextContent}</Text>
                            </View>
                        }

                        <View style={styles.usernamedescription_wrapper}>
                            <TouchableOpacity onPress={this.pressUsername.bind(this)}>
                                <Text style={styles.text_black14}>@{this.state.feedUsername}</Text>
                            </TouchableOpacity>
                            <Text style={styles.text_regular13}>{description}</Text>
                        </View>


                        {/* buy button */}
                        {!this.state.isMyPost &&
                            <View style={styles.buy_wrapper}>
                                <TouchableOpacity
                                    disabled={this.state.isMyPost ? true : false}
                                    onPress={this.pressBuy.bind(this)} style={[styles.buy_button, { backgroundColor: this.state.isMyPost ? 'gray' : Global.colorButtonBlue }]}>

                                    <Text style={styles.buy_text}>BUY</Text>

                                </TouchableOpacity>
                            </View>
                        }

                    </View>

                    {/* 3 icons comment like share */}
                    <View style={styles.icongroup_wrapper}>
                        <TouchableOpacity onPress={this.pressIcons.bind(this, 1)} style={{ marginLeft: 20 }}>
                            <Image
                                source={commenticon}
                                style={styles.eachicon}
                                resizeMode='contain' />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.pressIcons.bind(this, 2)} style={styles.likeiconbtn}>
                            <Image
                                source={likeicon}
                                style={styles.eachicon}
                                resizeMode='contain' />

                            {likeCount !== 0 &&
                                <Text style={styles.text_bold10}>{likeCount}</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.pressIcons.bind(this, 3)}>
                            <Image
                                source={shareicon}
                                style={styles.eachicon}
                                resizeMode='contain' />
                        </TouchableOpacity>
                    </View>

                    {/* line */}
                    <View style={styles.iconsbottomline}></View>

                    {/* triangle */}
                    <View style={{ width: '100%', paddingLeft: TrianglePaddingLeft }}>
                        <Image
                            source={require('@images/triangle_white.png')}
                            style={styles.linetriangle}
                            resizeMode='contain' />
                    </View>


                    {/* comment like share content area */}
                    <View style={styles.iconcontentarea_wrapper}>

                        {this.state.iconIndex === 1 &&
                            <FlatList
                                data={this.state.commentList}
                                extraData={this.state}
                                renderItem={({ item }) => this.renderCommentItem(item)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        }

                        {/* add a comment */}
                        {this.state.iconIndex === 1 &&
                            <View style={styles.addcomment_wrapper}>

                                <TextInput
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    underlineColorAndroid="transparent"
                                    multiline={true}
                                    maxLength={Global.TM150}
                                    textAlignVertical='bottom'
                                    style={styles.addcomment_input}
                                    onChangeText={(text) => this.setState({ mycomment: text })}
                                    value={this.state.mycomment}
                                    placeholder="add a comment"
                                    placeholderTextColor='black'
                                    returnKeyType="send"
                                    onSubmitEditing={this.sendComment}
                                />

                                <TouchableOpacity disabled={this.state.isCommentSending} style={styles.addcomment_send} onPress={this.sendComment.bind(this)} >
                                    <MaterialIcons name="send" size={25} color={istypingComment ? Global.colorButtonBlue : 'gray'} />
                                </TouchableOpacity>

                            </View>
                        }

                        {/* like */}
                        {this.state.showLikeSection && this.renderLikeUsers()}

                        {/* share */}
                        {this.state.iconIndex === 3 &&
                            <View style={{ marginLeft: TrianglePaddingLeft, width: '100%', flexDirection: 'row' }}>

                                {/* <TouchableOpacity onPress={this.pressSocailShareIcon.bind(this, 1)}>
                                    <AntDesign name="facebook-square" size={25} color={'black'} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ marginLeft: 15 }} onPress={this.pressSocailShareIcon.bind(this, 2)}>
                                    <AntDesign name="instagram" size={25} color={'black'} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ marginLeft: 15 }} onPress={this.pressSocailShareIcon.bind(this, 3)}>
                                    <AntDesign name="twitter" size={25} color={'black'} />
                                </TouchableOpacity> */}
                            </View>
                        }

                    </View>

                    <View style={{ height: 15 }}></View>

                </ScrollView>

                <View style={{ height: Global.TabBarHeight }}></View>

            </KeyboardAwareScrollView>
        );
    }
}

export default withNavigationFocus(FeedItemScreen);

const styles = StyleSheet.create({
    indicator_wrapper: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    text_black12: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 12
    },
    commentitem_wrapper: {
        marginTop: 5,
        width: "100%",
        flexDirection: "row"
    },
    commentitem_text: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 12,
        width: "75%"
    },
    likeuserlist_wrapper: {
        marginTop: 5,
        flexDirection: "row"
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center"
    },
    arrowbtn_wrapper: {
        width: "100%",
        marginTop: 10,
        marginLeft: 15,
        justifyContent: "flex-start"
    },
    arrowbtn: {
        width: "16%",
        justifyContent: "center",
        alignItems: "center"
    },
    dots_wrapper: {
        width: "100%",
        minHeight: 20,
        justifyContent: "flex-end",
        alignItems: "flex-end"
    },
    modal_container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "#ffffff88"
    },
    modal_wrapper: {
        alignSelf: "center",
        top: 150,
        width: 0.5 * Global.screenWidth,
        backgroundColor: "white",
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal_item: {
        // flex: 0.5,
        justifyContent: "center",
        alignItems: "center",
        height: modalItemHeight
    },
    main_container: {
        flex: 1,
        width: "100%"
    },
    main_wrapper: {
        width: "90%",
        flexDirection: "column"
    },
    titleprice_wrapper: {
        marginTop: 10,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    text_black16: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 16
    },
    subtext_wrapper: {
        marginTop: 10,
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    text_regular13: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13
    },
    text_black14: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 14
    },
    usernamedescription_wrapper: {
        marginTop: 20,
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start"
    },
    buy_wrapper: {
        marginTop: 40,
        width: "100%",
        height: Math.round(Global.screenWidth * 0.1),
        alignItems: "center"
    },
    buy_button: {
        width: "40%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    buy_text: {
        lineHeight: Math.round(Global.screenWidth * 0.1),
        fontFamily: Global.Nimbus_Black,
        fontSize: 20,
        color: "white"
    },
    icongroup_wrapper: {
        marginTop: 40,
        width: "100%",
        flexDirection: "row"
    },
    likeiconbtn: {
        flexDirection: "column",
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20
    },
    eachicon: {
        width: iconWidth,
        height: iconWidth
    },
    text_bold10: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 10
    },
    iconsbottomline: {
        marginTop: 5,
        width: "100%",
        height: 1,
        backgroundColor: "black"
    },
    linetriangle: {
        top: -1,
        width: iconWidth / 2,
        height: iconWidth / 2
    },
    iconcontentarea_wrapper: {
        width: "100%",
        minHeight: 100,
        paddingTop: 10,
        paddingLeft: commentTrianglePaddingLeft,
        paddingRight: commentTrianglePaddingLeft,
        flexDirection: "column"
    },
    addcomment_wrapper: {
        marginTop: 30,
        width: "100%",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    addcomment_input: {
        width: "90%",
        fontFamily: Global.Nimbus_Regular,
        fontSize: 12,
        fontWeight: "normal"
    },
    addcomment_send: {
        position: "absolute",
        right: 0,
        bottom: 0
    },
    text_black20: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 20
    }
});