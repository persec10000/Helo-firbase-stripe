
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, StyleSheet, FlatList, SafeAreaView, Animated, Easing } from 'react-native';
import { NavigationActions, withNavigationFocus } from 'react-navigation';

import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const imageItemWidth = Math.round(Global.screenWidth * 0.425);
const marginTopFlatList = Math.round(Global.screenWidth * 0.05);
const doubleClickDelta = 200;
const headerHeight = Math.round(Global.screenWidth * 0.2);
const myFeedHeight = Math.round(Global.screenWidth * 0.09);


class HomeScreen extends Component { //'HomeScreen'
  static navigationOptions = ({ navigation }) => ({
    header: null,
  });

  constructor(props) {
    super(props)
    this.state = {
      feeds: [],
      lastPressForDoubleClick: 0,
      dontupdate: false,
      loading: true,
      refreshing: false,
      lastVisible: null,
      isIphoneX: false,
      isDoubleClick: false,
      scrollBegin: false,
      isFetchEnded: false,
      favouriteItemIndex: undefined,
      favouriteItemSubIndex: undefined
    };
    this.animatedValue = new Animated.Value(30)
    this.timer = null;
  }

  componentDidMount() {
    this.realtimeCatchDatabaseChange();
    this.checkTimePassedOrder();
    Fire.shared.setLastLogin();
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.isFocused) {
      this.setState({
        isFetchEnded: false
      })
      this.getFeedOfMyFollow();
    }
  }

  componentDidUpdate(prevprops, prevstate) {
    if (this.state.favouriteItemIndex !== undefined && this.state.favouriteItemSubIndex !== undefined) {
      this.timer = setTimeout(() => {
        this.setState(() => ({favouriteItemIndex: undefined, favouriteItemSubIndex: undefined}))
        this.animatedValue = new Animated.Value(30);
      }, 1000);
    }
  }

  handleAnimation = () => {
    Animated.timing(this.animatedValue, {
      toValue: 80,
      duration: 800,
      easing: Easing.ease
    }).start();
  }

  realtimeCatchDatabaseChange() {
    // catch sold status = 6 for sold page
    const callbackCatchForMySale = (oneSoldTransaction) => { // called only once status = 6
      Fire.shared.getUserName(oneSoldTransaction.other).then((username) => {
        Fire.shared.setSoldConfirmed(oneSoldTransaction.transactionId, oneSoldTransaction.other).then(() => {
          const navigateAction = NavigationActions.navigate({
            routeName: 'BoughtAndSold',
            params: {
              uid: oneSoldTransaction.other,
              username: username,
              bought: false,
              transactionid: oneSoldTransaction.transactionId,
            }
          });
          this.props.navigation.dispatch(navigateAction);
        }).catch((error) => Global.isDev && console.log(error));
      }).catch((error) => Global.isDev && console.log(error));
    }
    Fire.shared.catchForMySale(callbackCatchForMySale);
  }

  checkTimePassedOrder() {
    Fire.shared.getMyOrders('only_status_2').then((res) => {
      if (isEmpty(res)) {
        return;
      }

      let uidarray = [];
      for (let i = 0; i < res.length; i++) {
        const element = res[i].other;
        if (!uidarray.includes(element)) {
          uidarray.push(element);
        }
      }

      Fire.shared.getUserNamesAndAvatars(uidarray).then((userNameAndAvatarsAsUid) => {
        if (isEmpty(userNameAndAvatarsAsUid)) {
          return;
        }
        let pickupTimePassed = false;
        for (let i = 0; i < res.length; i++) {
          const item = res[i];

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
          if (pickupTimePassed) {
            const navigateAction = NavigationActions.navigate({
              routeName: 'PickupAndDropoffConfirm',
              params: {
                from: 'HomeScreen',
                me: item.me,
                otheruid: item.other,
                otherusername: userNameAndAvatarsAsUid[item.other].username,
                transactionid: item.transactionid,
                postids: item.postids,
                price: item.price,
                firstbuy: item.firstbuy || false,
              }
            });
            this.props.navigation.dispatch(navigateAction);
            return;
          }
        }
      })
    }).catch((error) => Global.isDev && console.log(error));
  }


  getFeedOfMyFollow() { // first fetch
    this.setState({ loading: true, refreshing: true, });
    Fire.shared.getFeedOfMyFollow().then(({ newArray, lastVisible }) => {
      this.setState({ feeds: newArray, loading: false, refreshing: false, lastVisible: lastVisible })
    }).catch((err) => Global.isDev && console.log(err))
  }

  getFeedMore = () => { // more fetch
    if (this.state.isFetchEnded) return;
    if (this.state.loading || this.state.refreshing) {
      return;
    }
    this.setState({ loading: true, refreshing: true });
    Fire.shared.getFeedOfMyFollow(this.state.lastVisible).then(({ newArray, lastVisible }) => {
      if (newArray.length === 0) {
        this.setState({
          isFetchEnded: true,
        })
      }
      let tempArray = this.state.feeds;
      for (let i = 0; i < newArray.length; i++) {
        const element = newArray[i];
        tempArray.push(element);
      }
      this.setState({ feeds: tempArray, loading: false, refreshing: false, lastVisible: lastVisible })
    }).catch((error) => Global.isDev && console.log(error))
  }

  pressbag() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'ActiveOrdersScreen',
    });
    this.props.navigation.dispatch(navigateAction);
  }
  pressheart() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'MyProfileScreen',
      params: {
        from: 'HomeScreen'
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressFeedItem(index, subindex, sold) {
    if (sold) return;
    const delta = new Date().getTime() - this.state.lastPressForDoubleClick;
    this.setState({
      lastPressForDoubleClick: new Date().getTime()
    })

    if (delta < doubleClickDelta) { // double click - like
      this.setState({
        isDoubleClick: true,
        favouriteItemIndex: index,
        favouriteItemSubIndex: subindex
      })

      // feed like setting
      const item = this.state.feeds[index][subindex];
      const myuid = Fire.shared.uid;
      
      let likelist = item.like || []; // uids
      if (!likelist.includes(myuid)) {
        likelist.push(myuid);

        Fire.shared.setMyLike(item.postid, likelist);
        Fire.shared.increaseEngagementCount();
        Fire.shared.getUserName().then((myname) => {
          const likeNotificationObj = {
            type: 1,
            username: myname,
            picture: item.picture[0],
          }
          Fire.shared.setNotification(item.uid, likeNotificationObj);
        })

        const newFeeds = this.state.feeds.slice()
        newFeeds[index][subindex].like = likelist;
        this.setState({
          feeds: newFeeds
        })
      }

      this.handleAnimation();

    } else { // not double click
      this.setState({
        isDoubleClick: false
      })

      setTimeout(() => {
        if (!this.state.isDoubleClick) {
          const item = this.state.feeds[index][subindex];
          const navigateAction = NavigationActions.navigate({
            routeName: 'FeedItemScreen',
            params: {
              from: 'HomeScreen',
              item: item
            },
          });
          this.props.navigation.dispatch(navigateAction);
        }
      }, doubleClickDelta + 50);
    }
  }

  renderFeedItem(item, index) {
    let groupImages = [];
    for (let i = 0; i < item.length; i++) {

      const price = item[i].price || '';
      const sold = item[i].sold || false;

      let firstItemTitle = '';
      let firstItemContent = '';
      if (item[i].category === 1) {
        firstItemTitle = 'size';
        firstItemContent = Global.sizeSet[item[i].size - 1];
      } else if (item[i].category === 4) {
        firstItemTitle = 'code';
        firstItemContent = item[i].brand; // book class code
      }

      const animatedStyle = { width: this.animatedValue, height: this.animatedValue }

      const { favouriteItemIndex, favouriteItemSubIndex } = this.state;

      groupImages.push(
        <View key={i} style={styles.feed_container}>
          <TouchableOpacity onPress={this.pressFeedItem.bind(this, index, i, sold)}>
            <Image
              source={{ uri: item[i].hasOwnProperty('picture') ? item[i].picture[0] : '' }}
              style={styles.feed_image}
              resizeMode='contain' />

            {sold &&
              <View style={styles.feed_sold}>
                <Text style={styles.feed_soldtext}>sold</Text>
              </View>
            }
          </TouchableOpacity>

          <View style={styles.feed_contentwrapper}>

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.text_bold12}>{firstItemTitle} </Text>
              <Text style={styles.text_black12}>{firstItemContent}</Text>
            </View>

            <Text style={styles.text_black12}>${price}</Text>
          </View>

          { (favouriteItemIndex === index && favouriteItemSubIndex === i) &&
            <View style={[{position: "absolute", width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}, {display: 'flex'}]}>
              <Animated.View style={[{width: 30, height: 30}, animatedStyle]}>
                <Image
                  source={require('@images/like_click.png')}
                  style={{width: "100%", height: "100%"}}
                  resizeMode='contain'
                />
              </Animated.View>
            </View>
          }
        </View>
      )
    }
    return (
      <View style={styles.feedline_container}>
        <View style={styles.feedline_wrapper}>
          {groupImages}
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

  render() {
    return (

      <SafeAreaView style={styles.container}>

        <View onLayout={(event) => this.getIsIphoneX(event)} style={[styles.screenwrapper, { paddingBottom: this.state.isIphoneX ? Global.TabBarHeight - 34 : Global.TabBarHeight }]}>

          {/* header */}
          <View transparent style={styles.header_wrapper}>

            {/* heart icon */}
            <TouchableOpacity onPress={this.pressheart.bind(this)} style={styles.hearticon_wrapper}>
              <Image
                source={require('@images/like.png')}
                style={styles.topicon_image}
                resizeMode='contain' />
            </TouchableOpacity>

            {/* header */}
            <View style={styles.headertitle_wrapper}>
              <Text style={styles.headertitle}>hēlo</Text>
            </View>

            {/* shopping-bag icon */}
            <TouchableOpacity style={styles.bagicon_wrapper} onPress={this.pressbag.bind(this)}>
              <Image
                source={require('@images/shopping-bag.png')}
                style={styles.topicon_image}
                resizeMode='contain' />
            </TouchableOpacity>

          </View>


          {/* myfeed */}
          <View style={styles.myfeed_wrapper}>
            <Text style={styles.myfeed_text}>my feed</Text>
          </View>

          <ScrollView style={styles.w100}>
            <FlatList
              data={this.state.feeds}
              extraData={this.state}
              renderItem={({ item, index }) => this.renderFeedItem(item, index, this.state.favouriteItemIndex, this.state.favouriteItemSubIndex)}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={this.getFeedMore}
              onEndReachedThreshold={0.1}
            />

            {this.state.loading &&
              <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
            }
          </ScrollView>

        </View>

      </SafeAreaView>
    );
  }
}

export default withNavigationFocus(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "center",
  },
  screenwrapper: {
    width: "100%",
    height: "100%",
  },
  header_wrapper: {
    flexDirection: "row",
    height: headerHeight,
    width: "100%"
  },
  hearticon_wrapper: {
    flex: 0.15,
    height: "60%",
    justifyContent: "center",
    alignItems: "center"
  },
  topicon_image: {
    width: 30,
    height: 30
  },
  headertitle_wrapper: {
    flex: 0.7,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: "10%"
  },
  headertitle: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 38,
    color: "black"
  },
  bagicon_wrapper: {
    flex: 0.15,
    height: "60%",
    justifyContent: "center",
    alignItems: "center"
  },
  myfeed_wrapper: {
    backgroundColor: Global.colorButtonBlue,
    width: "100%",
    height: myFeedHeight,
    justifyContent: "center"
  },
  myfeed_text: {
    lineHeight: myFeedHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    paddingLeft: 10
  },
  feedline_container: {
    marginTop: marginTopFlatList,
    width: "100%",
    alignItems: "center"
  },
  feedline_wrapper: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  feed_container: {
    width: imageItemWidth,
    flexDirection: "column"
  },
  feed_image: {
    width: imageItemWidth,
    height: imageItemWidth
  },
  feed_sold: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colorSoldBack
  },
  feed_soldtext: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    color: "white"
  },
  feed_contentwrapper: {
    marginTop: 5,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text_bold12: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12
  },
  text_black12: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 12
  },
  w100: {
    width: '100%'
  }
});