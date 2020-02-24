import React, { Component } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';

const avatarwidth = Math.round(Global.screenWidth * 0.1);
const followingbtnwidth = Math.round(avatarwidth * 0.5);

export default class FollowView extends Component { //'FollowViewScreen'
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            uid: '',
            title: '',
            isFollowers: true,
            loading: true,
            datalist: [],
            isMyProfileFollowing: false,
            myfollowinglist: [],
            changedMyFollowing: false,
            fromOtherProfile: false,
        };
    }
    componentDidMount() {
        const { params } = this.props.navigation.state;
        const uid = params.uid;
        const isFollowers = params.isFollowers;
        const title = isFollowers ? 'followers' : 'following';
        this.setState({
            uid: uid,
            title: title,
            isFollowers: isFollowers,
            fromOtherProfile: params.from && params.from === 'OtherProfileScreen' ? true : false,
        });
        Fire.shared.getFollowList(uid, isFollowers).then((result) => {
            if (Fire.shared.uid === uid && !isFollowers) {
                let myfollowinglist = [];
                for (let i = 0; i < result.length; i++) {
                    myfollowinglist.push(result[i].uid)
                }
                this.setState({
                    isMyProfileFollowing: true,
                    myfollowinglist: myfollowinglist,
                })
            }

            this.setState({
                loading: false,
                datalist: result,
            })

        }).catch((error) => {
            this.setState({ loading: false });
            Global.isDev && console.log(error);
        })
    }
    componentWillUnmount() {
        if (this.state.changedMyFollowing) {
            this.setMyFollowingList();
        }
    }
    setMyFollowingList = async () => {
        await Fire.shared.setMyFollowingList(this.state.myfollowinglist);
    }
    pressMyFollow(uid) {
        let arrayFollowingListTemp = this.state.myfollowinglist;
        if (arrayFollowingListTemp.includes(uid)) {
            for (var i = 0; i < arrayFollowingListTemp.length; i++) {
                if (arrayFollowingListTemp[i] === uid) {
                    arrayFollowingListTemp.splice(i, 1);
                }
            }
        } else {
            arrayFollowingListTemp.push(uid);
        }
        this.setState({
            myfollowinglist: arrayFollowingListTemp,
            changedMyFollowing: true,
        });
    }
    pressItem(uid) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'FollowViewScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    renderFlatListItem(item) {
        let nowfollowing = false;
        if (this.state.myfollowinglist.includes(item.uid)) {
            nowfollowing = true;
        }
        return (

            <View style={styles.item_container}>

                <View style={styles.item_wrapper}>

                    <TouchableOpacity disabled={this.state.fromOtherProfile} onPress={this.pressItem.bind(this, item.uid)} style={styles.f_row}>
                        <View style={styles.item_avatarwrapper}>
                            <Image
                                source={{ uri: item.avatar }}
                                style={styles.item_avatar}
                                resizeMode='contain' />
                        </View>

                        <View style={styles.item_userinfo}>
                            <Text style={styles.item_name}>{item.name}</Text>
                            <Text style={styles.item_username}>@{item.username}</Text>
                        </View>
                    </TouchableOpacity>

                    {this.state.isMyProfileFollowing &&
                        <View style={styles.item_followingbtn_wrapper}>
                            <TouchableOpacity onPress={this.pressMyFollow.bind(this, item.uid)} style={[styles.item_followingbtn, { backgroundColor: nowfollowing ? 'darkgray' : 'lightgray' }]}>
                                <Text style={styles.item_followingbtn_text}>{nowfollowing ? 'following' : 'follow'}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </View>
        )
    }
    renderSeparator() {
        return (
            <View style={{ height: 20 }}></View>
        )
    }
    pressBackArrow = () => {
        if (this.state.changedMyFollowing) {
            this.setMyFollowingList();
            this.setState({
                changedMyFollowing: false,
            })
        }
        this.props.navigation.goBack();
    }
    render() {

        return (
            <View style={styles.container}>

                <AppHeaderArrow title={this.state.title} pressArrow={this.pressBackArrow.bind(this)} />

                <ScrollView style={styles.main_container} contentContainerStyle={{ alignItems: 'center' }}>

                    {this.state.loading ?
                        <View style={styles.indicator_wrapper}>
                            <ActivityIndicator size="large" color="#f39c12" />
                        </View>
                        :
                        <FlatList
                            data={this.state.datalist}
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
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    main_container: {
        flex: 1,
        width: "100%",
        height: "100%",
        flexDirection: "column"
    },
    indicator_wrapper: {
        width: "100%",
        height: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    item_container: {
        width: Global.screenWidth,
        height: avatarwidth,
        alignItems: "center"
    },
    item_wrapper: {
        width: "90%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    item_avatarwrapper: {
        width: avatarwidth,
        height: avatarwidth,
        borderRadius: Math.round(avatarwidth / 2),
        overflow: "hidden"
    },
    item_avatar: {
        width: "100%",
        height: "100%"
    },
    item_userinfo: {
        marginLeft: 20,
        flexDirection: "column",
        height: "100%",
        justifyContent: "center"
    },
    item_name: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 13
    },
    item_username: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 12
    },
    item_followingbtn_wrapper: {
        height: "100%",
        justifyContent: "center"
    },
    item_followingbtn: {
        borderRadius: 15,
        paddingHorizontal: 8,
        height: followingbtnwidth
    },
    item_followingbtn_text: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 10,
        lineHeight: followingbtnwidth
    },
    f_row: {
        flexDirection: 'row'
    }
});