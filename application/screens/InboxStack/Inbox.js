
import React, { Component } from 'react';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { TouchableOpacity, View, Image, ScrollView, Text, SafeAreaView, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const headerHeight = Math.round(Global.screenWidth * 0.2);
const blueButtonsHeight = Math.round(Global.screenWidth * 0.08);
const horizontalButtonLineTop = - Math.round(blueButtonsHeight * 0.25);
const itemHeight = Math.round(Global.screenWidth * 0.28);
const imageWidth = Math.round(Global.screenWidth * 0.18);

function timeConverter(timestamp) {
  let a = new Date(timestamp * 1000);
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let month = months[a.getMonth()];
  let date = a.getDate();
  let monthdate = month + ' ' + date;
  return monthdate;
}

class InboxScreen extends Component { // 'InboxScreen'
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      screenindex: 1,
      isEmptyOrders: false,
      isEmptyInbox: false,
      inboxArray: [],
      userNameAndAvatarAsUid: {},
      myuid: Fire.shared.uid,
      friendchatlist: [],
      isIphoneX: false,
    };
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.isFocused) {
      this.setState({
        loading: true,
      })
      if (this.state.screenindex === 2) {
        this.getFriendsChatInfo();
      } else {
        this.getOrdersInfo();
      }
    }
  }

  getOrdersInfo() {
    Fire.shared.getMyOrdersInboxInfo().then((res) => {
      if (isEmpty(res)) {
        this.setState({
          loading: false,
          isEmptyOrders: true,
          inboxArray: [],
        })
        this.getFriendsChatInfo();
        return;
      }

      let uidarray = [];
      uidarray.push(this.state.myuid);
      for (let i = 0; i < res.length; i++) {
        if (!uidarray.includes(res[i].other)) {
          uidarray.push(res[i].other);
        }
      }

      Fire.shared.getUserNamesAndAvatars(uidarray).then((usernamesandavatars) => {
        this.setState({
          userNameAndAvatarAsUid: usernamesandavatars,
          inboxArray: res,
          loading: false,
        })
      })
    }).catch((error) => Global.isDev && console.log(error));
  }

  getFriendsChatInfo() {
    this.setState({
      loading: true,
    })
    Fire.shared.getFriendsChatInfo().then((res) => {
      if (isEmpty(res)) {
        this.setState({
          loading: false,
          friendchatlist: [],
        })
        if (this.state.isEmptyOrders) {
          this.setState({
            isEmptyInbox: true
          })
        }
        return;
      }
      // sort by chat date
      let result = res;
      result.sort(function (x, y) {
        const x_chatTimes = Object.keys(x.chat);
        const x_lastChatTimeStamp = x_chatTimes[x_chatTimes.length - 1];
        const y_chatTimes = Object.keys(y.chat);
        const y_lastChatTimeStamp = y_chatTimes[y_chatTimes.length - 1];
        return y_lastChatTimeStamp - x_lastChatTimeStamp;
      })

      let uidarray = [];
      for (let i = 0; i < res.length; i++) {
        uidarray.push(res[i].other)
      }
      Fire.shared.getUserNamesAndAvatars(uidarray).then((usernamesandavatars) => {
        const tempObj = {
          ...this.state.userNameAndAvatarAsUid,
          ...usernamesandavatars
        }

        this.setState({
          userNameAndAvatarAsUid: tempObj,
          friendchatlist: result,
          loading: false,
        })
      })
    }).catch((error) => Global.isDev && console.log(error));
  }

  pressSubScreen(index) {
    this.setState({ screenindex: index });
    if (index === 1) {
    } else if (index === 2) {
      if (this.state.friendchatlist.length < 1) {
        this.getFriendsChatInfo();
      }
    }
  }



  pressItem(transactionid) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'OrderChatScreen',
      params: {
        transactionid: transactionid
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }
  pressFriendChatItem(otheruid) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'FriendChatScreen',
      params: {
        from: 'InboxScreen',
        uid: otheruid,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressOtherAvatar(otheruid) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'OtherProfileScreen',
      params: {
        from: 'InboxScreen',
        uid: otheruid,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }

  renderFlatListItem(item) {
    if (isEmpty(item.chat)) return;
    const chatTimes = Object.keys(item.chat);
    const lastChatTimeStamp = chatTimes[chatTimes.length - 1]
    const itemdate = timeConverter(lastChatTimeStamp);
    const lastChatObj = item.chat[lastChatTimeStamp]

    if (isEmpty(this.state.userNameAndAvatarAsUid[item.other])) {
      return;
    }
    let otherAvatar = this.state.userNameAndAvatarAsUid[item.other].avatar;
    let otherUsername = this.state.userNameAndAvatarAsUid[item.other].username;

    let itemtext = '';
    if (this.state.screenindex === 1) {

      if (lastChatObj.type === 0) {
        if (item.me === lastChatObj.who) {
          itemtext = 'you declined the pickup'
        } else {
          itemtext = '@' + otherUsername + ' declined the pickup'
        }

      } else if (lastChatObj.type === 1) {
        if (item.me === lastChatObj.who) {
          itemtext = 'you proposed a pickup'
        } else {
          itemtext = '@' + otherUsername + ' proposed a pickup'
        }
      } else if (lastChatObj.type === 2) {
        if (item.me === lastChatObj.who) {
          itemtext = 'you proposed a new pickup'
        } else {
          itemtext = '@' + otherUsername + ' proposed a new pickup'
        }
      } else if (lastChatObj.type === 3) {
        if (item.me === lastChatObj.who) {
          itemtext = 'you accepted the pickup'
        } else {
          itemtext = '@' + otherUsername + ' accepted the pickup'
        }
      } else if (lastChatObj.type === 4) {
        itemtext = lastChatObj.info;
      }
    } else { // screenindex 2
      itemtext = lastChatObj.info;
    }

    return (

      <View style={styles.each_container}>

        <View onPress={this.state.screenindex === 1 ? this.pressItem.bind(this, item.transactionid) : this.pressFriendChatItem.bind(this, item.other)} style={styles.each_wrapper}>

          <TouchableOpacity onPress={this.pressOtherAvatar.bind(this, item.other)} >
            <Image
              source={{ uri: otherAvatar }}
              style={styles.each_avatar}
              resizeMode='cover' />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.state.screenindex === 1 ? this.pressItem.bind(this, item.transactionid) : this.pressFriendChatItem.bind(this, item.other)} style={styles.each_rightarea}>
            <Text style={styles.each_usernametext}>@{otherUsername}</Text>
            <View style={styles.each_subtextwrapper}>
              <View style={styles.each_subtextview}>
                <Text style={styles.text_regular12}>{itemtext}</Text>
              </View>
              <Text style={styles.text_bold12}>{itemdate}</Text>
            </View>
          </TouchableOpacity>

        </View>

      </View>
    )
  }
  getIsIphoneX(event) {
    const { y } = event.nativeEvent.layout;
    if (y > 40) {
      this.setState({ isIphoneX: true });
    }
  }

  renderEmptyInbox() {
    return (
      <View style={styles.empty_maincontainer}>

        <View style={styles.empty_headerwrapper}>
          <Text style={styles.text_black36}>inbox</Text>
        </View>

        <View style={styles.empty_subtextwrapper}>
          <Text style={styles.text_black18}>your inbox is</Text>
          <Text style={styles.text_black18}>empty :(</Text>
        </View>

        <View style={styles.empty_bkimagewrapper}>
          <Image
            source={require('@images/back_emptyInbox.png')}
            style={styles.empty_bkimage}
            resizeMode='contain' />
        </View>

      </View>
    )
  }

  render() {

    if (this.state.isEmptyInbox) {
      return (
        <View style={styles.empty_container}>
          {this.renderEmptyInbox()}
        </View>
      )
    }

    return (

      <SafeAreaView style={styles.safearea_container}>

        <View onLayout={(event) => this.getIsIphoneX(event)} style={[styles.container, { paddingBottom: this.state.isIphoneX ? Global.TabBarHeight - 34 : Global.TabBarHeight }]}>

          {/* header */}
          <View transparent style={styles.header_wrapper}>
            <Text style={styles.text_black36}>inbox</Text>
          </View>

          {/* blue buttons */}
          <View style={styles.categorybar_wrapper}>

            <TouchableOpacity onPress={this.pressSubScreen.bind(this, 1)} style={[styles.categorybar_itemwrapper, { borderRightColor: 'white', borderRightWidth: 1 }]} >
              <View style={styles.f_col}>
                <Text style={styles.categorybar_item}>orders</Text>
                <View style={{ top: horizontalButtonLineTop, height: 1, backgroundColor: this.state.screenindex === 1 ? 'white' : Global.colorButtonBlue }}></View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.pressSubScreen.bind(this, 2)} style={styles.categorybar_itemwrapper} >
              <View style={styles.f_col}>
                <Text style={styles.categorybar_item}>friends</Text>
                <View style={{ top: horizontalButtonLineTop, height: 1, backgroundColor: this.state.screenindex === 2 ? 'white' : Global.colorButtonBlue }}></View>
              </View>
            </TouchableOpacity>

          </View>


          <ScrollView style={styles.items_area}>
            {this.state.loading &&
              <View style={styles.indicator_wrapper}>
                <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
              </View>
            }

            <FlatList
              data={this.state.screenindex === 1 ? this.state.inboxArray : this.state.friendchatlist}
              extraData={this.state}
              renderItem={({ item }) => this.renderFlatListItem(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>

        </View>

      </SafeAreaView>
    )
  }

}

export default withNavigationFocus(InboxScreen);

const styles = StyleSheet.create({
  empty_container: {
    flex: 1,
    width: "100%",
    backgroundColor: Global.colorGreen,
    paddingBottom: Global.TabBarHeight
  },
  empty_maincontainer: {
    width: "100%",
    height: "100%"
  },
  empty_headerwrapper: {
    borderBottomWidth: 0,
    flexDirection: "row",
    height: Global.screenWidth * 0.25,
    justifyContent: "center",
    alignItems: 'flex-end'
  },
  text_black36: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 36,
    color: "black"
  },
  text_black18: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 18,
    color: "black"
  },
  empty_bkimagewrapper: {
    marginTop: "8%",
    width: "100%",
    height: Global.screenHeight * 0.35,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  empty_bkimage: {
    width: "90%",
    height: "100%"
  },
  empty_subtextwrapper: {
    width: "100%",
    height: Global.screenHeight * 0.2,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  safearea_container: {
    flex: 1,
    backgroundColor: Global.colorGreen,
    alignItems: "center"
  },
  container: {
    width: "100%",
    height: "100%"
  },
  header_wrapper: {
    borderBottomWidth: 0,
    flexDirection: "row",
    height: headerHeight,
    justifyContent: "center",
    alignItems: "center"
  },
  categorybar_wrapper: {
    height: blueButtonsHeight,
    width: "100%",
    flexDirection: "row",
    alignItems: "center"
  },
  categorybar_itemwrapper: {
    flex: 0.5,
    height: "100%",
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  categorybar_item: {
    lineHeight: blueButtonsHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 14
  },
  items_area: {
    flex: 1,
    width: "100%",
    flexDirection: "column"
  },
  indicator_wrapper: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  each_container: {
    width: "100%",
    height: itemHeight,
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  each_wrapper: {
    width: "85%",
    height: "70%",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  each_avatar: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: Math.round(imageWidth / 2)
  },
  each_rightarea: {
    marginLeft: 15
  },
  each_usernametext: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 14,
    left: -15
  },
  each_subtextwrapper: {
    flexDirection: "row",
    width: Global.screenWidth * 0.63,
    height: "70%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  each_subtextview: {
    width: "60%",
    flexDirection: "row"
  },
  text_regular12: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 12
  },
  text_bold12: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12
  },
  f_col: {
    flexDirection: 'column'
  }
});