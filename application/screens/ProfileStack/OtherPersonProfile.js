import React, { Component } from 'react';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { TouchableOpacity, View, Image, StyleSheet, Text, ScrollView, FlatList, ActivityIndicator, Modal, Platform } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const imageItemWidth = Math.round(Global.screenWidth * 0.94 * 0.32);
const itemSpace = Math.round(Global.screenWidth * 0.94 * 0.02);
const avatarWidth = Math.round(Global.screenWidth * 0.27);
const widthReviewAvatar = Math.round(Global.screenWidth * 0.16);
const storeModalTop = Math.round(Global.screenHeight * 0.36)
const blueButtonsHeight = Math.round(Global.screenHeight * 0.04);
const horizontalButtonLineTop = - Math.round(blueButtonsHeight * 0.25);
const storeCategoryItems = ['all', 'clothes', 'tech', 'home', 'books', 'other'];
const followbarheight = 15;

class OtherProfile extends Component { //'OtherProfileScreen'
  static navigationOptions = ({ navigation }) => ({
    header: null,
  });
  constructor(props) {
    super(props);
    this.state = {
      otheruid: '',
      name: '',
      username: '',
      avatar: '',
      userNameAndAvatarsAsUid: {},
      university: '',
      major: '',
      gender: 0,
      vacation: false,
      numOfFollowers: 0,
      numOfFollowings: 0,
      includeMeInFollowers: false,
      screenindex: 1,               // 1:store, 2:liked, 3:reviews
      storescreenindex: 1,          // 1, 4~8
      loading: true,
      loadingStorelist: true,
      storeOrlikeArray: [],
      modalVisible: false,
    }
  }
  componentDidMount() {
    this.init();
  }
  componentWillReceiveProps(props) {
    if (props.isFocused) {
      this.init();
    }
  }
  componentWillUnmount() {
    this.setState({ modalVisible: false })
  }

  init() {
    const { params } = this.props.navigation.state;
    const uid = params && params.uid ? params.uid : '';
    if (uid === Fire.shared.uid) {
      this.props.navigation.navigate('MyProfileScreen');
      return;
    }
    this.setState({
      otheruid: uid,
      loading: true,
      loadingStorelist: true,
    })
    this.getUserProfile(uid);
    this.getMyStoreOrLikedData(1, uid)
  }


  getUserProfile(uid) {
    Fire.shared.getUserProfile(uid).then((res) => {
      const listFollowers = res.follower || [];
      const listFollowings = res.following || [];
      const review = res.review || [];

      let star = 0;
      let uidarray = [];
      for (let i = 0; i < review.length; i++) {
        star += review[i].star;
        if (!uidarray.includes(review[i].uid)) {
          uidarray.push(review[i].uid);
        }
      }
      if (review.length === 0) {
        star = 0;
      } else {
        star = Math.round(star / review.length);
      }

      Fire.shared.getUserNamesAndAvatars(uidarray).then((userNameAndAvatarsAsUid) => {
        this.setState({
          name: res.name || '',
          username: res.username || '',
          avatar: res.avatar || '',
          university: res.university || '',
          major: res.major || '',
          gender: res.gender,
          vacation: res.vacation || false,
          vacationBackDate: res.vacationBackDate || '',
          numOfFollowers: listFollowers.length,
          numOfFollowings: listFollowings.length,
          review: res.review,
          star: star,
          userNameAndAvatarsAsUid: userNameAndAvatarsAsUid,
          loading: false,
        });
      })
    }).catch((err) => Global.isDev && console.log(err))
  }


  pressModalItem(index) { // 4~8: clothes, tech, home, books, other
    this.setState({ modalVisible: false, storescreenindex: index, screenindex: 1 });
    this.getMyStoreOrLikedData(index);
  }


  pressSubScreen(index) {
    if (index === 1) {
      this.setState({
        modalVisible: true,
        screenindex: 1
      })
    } else if (index === 2) {
      this.setState({
        screenindex: 2,
      })
      this.getMyStoreOrLikedData(2);
    } else {
      this.setState({
        screenindex: 3,
      })
    }
  }

  getMyStoreOrLikedData(index, uid) { // 1:all, 2: liked, 3:reviews, 4:clothes, 5:tech, 6:home, 7:books, 8:other
    const fetchuid = isEmpty(uid) ? this.state.otheruid : uid;
    this.setState({ loadingStorelist: true });
    Fire.shared.getMyStoreOrLikedData(index, fetchuid).then((res) => {
      let returnArray = res;
      let tempArray = [];
      const tempArrayCount = Math.ceil(returnArray.length / 3)
      for (let i = 0; i < tempArrayCount; i++) {
        let threeArray = [];
        threeArray.push(returnArray[i * 3]);
        if (i * 3 + 1 < returnArray.length) threeArray.push(returnArray[i * 3 + 1]);
        if (i * 3 + 2 < returnArray.length) threeArray.push(returnArray[i * 3 + 2]);
        tempArray.push(threeArray);
      }
      this.setState({ storeOrlikeArray: tempArray, loadingStorelist: false });
    }).catch((err) => Global.isDev && console.log(err))
  }


  renderFiveStar(starNumber = 5, oneSize = 10, interval = 5) {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <View key={i} style={{ marginRight: (i == 5) ? 0 : interval }}>
          <AntDesign name={i <= starNumber ? "star" : "staro"} size={oneSize} color={'black'} />
        </View>
      )
    }
    return (
      <View style={{ flexDirection: 'row', marginVertical: 3 }}>
        {stars}
      </View>
    );
  }

  pressBackArrow() {
    const { params } = this.props.navigation.state;
    if (params && params.from) {
      const navigateAction = NavigationActions.navigate({
        routeName: params.from,
        params: {
          from: 'OtherProfileScreen',
          back: true,
        },
      });
      this.props.navigation.pop();
      this.props.navigation.dispatch(navigateAction);
    } else {
      this.props.navigation.goBack() // need to fix
    }
  }

  pressFlatListItem(index, i, sold) {
    if (sold) return;
    const pickObj = this.state.storeOrlikeArray[index][i];
    const { params } = this.props.navigation.state;
    const navigateAction = NavigationActions.navigate({
      routeName: 'FeedItemScreen',
      params: {
        from: 'OtherProfileScreen',
        item: pickObj,
        checkoutObjs: (params && params.checkoutObjs) ? params.checkoutObjs : [],
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }

  renderFlatlistItem(item, index) {

    let groupImages = [];
    for (let i = 0; i < item.length; i++) {
      let size = '';
      if (item[i].size && item[i].size > 0) {
        size = Global.sizeSet[item[i].size - 1]
      }
      const sold = item[i].sold || false;

      let firstItemTitle = '';
      let firstItemContent = '';

      if (item[i].category === 1) {
        firstItemTitle = 'size';
        firstItemContent = Global.sizeSet[item[i].size - 1];
      } else if (item[i].category === 4) {
        firstItemContent = item[i].brand; // book class code
      }


      groupImages.push(
        <TouchableOpacity onPress={this.pressFlatListItem.bind(this, index, i, sold)} key={i} style={{ width: imageItemWidth, marginLeft: i === 0 ? 0 : itemSpace, flexDirection: 'column' }}>

          <View style={styles.item_imagewrapper}>
            <Image source={{ uri: item[i].picture[0] }} style={styles.item_image} resizeMode='contain' />

            {sold &&
              <View style={styles.item_soldback}>
                <Text style={styles.text_bold15}>sold</Text>
              </View>
            }
          </View>

          <View style={styles.item_commentwrapper}>
            <View style={styles.item_leftcommentwrapper}>
              <Text style={styles.text_bold12}>{firstItemTitle} </Text>
              <Text style={styles.text_black12}>{firstItemContent}</Text>
            </View>

            <Text style={styles.text_bold10}>${item[i].price}</Text>
          </View>

        </TouchableOpacity>
      )
    }
    return (
      <View style={styles.item_container}>
        {groupImages}
      </View>
    )
  }



  render_storeOrlike() {

    return (

      <ScrollView style={styles.store_container} contentContainerStyle={styles.store_contentcontainer}>

        <View style={styles.store_wrapper}>
          <FlatList
            data={this.state.storeOrlikeArray}
            extraData={this.state}
            renderItem={({ item, index }) => this.renderFlatlistItem(item, index)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

      </ScrollView>
    )
  }

  pressFollow() {
    Fire.shared.setFollow(this.state.otheruid)
    Fire.shared.getUserProfile().then((res) => {
      const followNotificationObj = {
        type: 3,
        username: res.username,
        picture: res.avatar,
      }
      Fire.shared.setNotification(this.state.otheruid, followNotificationObj);
    })


    if (this.state.includeMeInFollowers) {
      this.setState({
        numOfFollowers: this.state.numOfFollowers - 1,
        includeMeInFollowers: false,
      })
    } else {
      this.setState({
        numOfFollowers: this.state.numOfFollowers + 1,
        includeMeInFollowers: true,
      })
    }
  }

  renderReviewFlatListItem(item) {
    if (isEmpty(this.state.userNameAndAvatarsAsUid[item.uid])) return;

    return (
      <View style={styles.reviewitem_container}>

        <View style={styles.reviewitem_avatarwrapper}>
          <View style={styles.reviewitem_avatarsubwrapper}>
            <Image
              source={{ uri: this.state.userNameAndAvatarsAsUid[item.uid].avatar }}
              style={styles.reviewitem_avatar}
              resizeMode='contain' />
          </View>
        </View>

        <View style={styles.reviewitem_space1}></View>

        <View style={styles.reviewitem_infowrapper}>

          {this.renderFiveStar(item.star, 10, 5)}
          <Text style={styles.text_regular11}>@{this.state.userNameAndAvatarsAsUid[item.uid].username}</Text>
          <Text style={styles.text_regular11}>"{item.text}"</Text>

        </View>

        <View style={styles.reviewitem_space2}></View>

        <View style={styles.reviewitem_timewrapper}>
          <Text style={styles.text_bold11}>{item.time}</Text>
        </View>

      </View>
    )
  }
  render_review() {
    const countReview = this.state.review && this.state.review.length || 0;
    if (countReview === undefined) return;

    return (

      <View style={styles.review_container}>

        <View style={styles.review_headerwrapper}>
          <View style={styles.review_headerstarstext}>
            <Text style={styles.text_black13}>{this.state.star} stars</Text>
          </View>
          <View style={styles.review_headerstars}>
            {this.renderFiveStar(this.state.star, 12, 10)}
          </View>
          <View style={styles.review_countwrapper}>
            <Text style={styles.text_black13}>{countReview} reviews</Text>
          </View>
        </View>

        {countReview !== 0 &&
          <Image
            source={require('@images/line_profilereview.png')}
            style={styles.w100}
            resizeMode='contain' />
        }
        {countReview !== 0 &&
          <ScrollView style={styles.w100} >

            <FlatList
              data={this.state.review}
              extraData={this.state}
              renderItem={({ item }) => this.renderReviewFlatListItem(item)}
              keyExtractor={(item, index) => index.toString()}
            />

          </ScrollView>
        }
      </View>
    )
  }

  pressMailIcon() {
    const uid = this.state.otheruid;
    const navigateAction = NavigationActions.navigate({
      routeName: 'FriendChatScreen',
      params: {
        from: 'OtherProfileScreen',
        uid: uid,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }
  pressFollowView(isFollowers) {
    const otheruid = this.state.otheruid;
    const navigateAction = NavigationActions.navigate({
      routeName: 'FollowViewScreen',
      params: {
        from: 'OtherProfileScreen',
        isFollowers: isFollowers,
        uid: otheruid,
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="#f39c12" />
        </View>
      )
    }

    const avatar = this.state.avatar !== '' ? { uri: this.state.avatar } : require('@images/avatar.png');

    // let vacation_month = '', vacation_date = '';
    // if (this.state.vacation) {
    //   const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    //   vacation_month = months[parseInt(this.state.vacationBackDate.substring(0, 2) - 1)]
    //   vacation_date = parseInt(this.state.vacationBackDate.substring(3, 5))
    // }

    return (
      <View style={[styles.container, { backgroundColor: this.state.vacation ? Global.colorPink : 'white' }]}>

        {/* left back arrow */}
        <View style={styles.topicons_wrapper}>
          <TouchableOpacity
            onPress={this.pressBackArrow.bind(this)}>
            <Image
              source={require('@images/leftarrow.png')}
              style={{ width: Global.HeaderArrowWidth }}
              resizeMode='contain' />
          </TouchableOpacity>

          <View style={styles.mailicon_wrapper}>
            <TouchableOpacity
              onPress={this.pressMailIcon.bind(this)} style={{ bottom: Platform.OS === 'ios' ? -10 : -5 }} >
              <Image
                source={require('@images/mail.png')}
                style={{ width: 30, height: 25 }}
                resizeMode='contain' />
            </TouchableOpacity>
          </View>

        </View>

        {/* name */}
        <View style={styles.name}>
          <Text style={styles.text_black22}>{this.state.name}</Text>
          {this.state.vacation &&
            <Text style={styles.name_vacationhint}>is on vacation.</Text>
          }
        </View>

        {/* avatar and info */}
        <View style={styles.info_container}>

          <View style={styles.space1}></View>

          <View style={styles.avatar_wrapper}>
            <View style={styles.avatar_subwrapper}>
              <Image
                source={avatar}
                style={styles.avatar}
                resizeMode='contain' />
            </View>

          </View>

          <View style={styles.space2}></View>

          {/* user info */}
          <View style={styles.userinfo_container}>

            <View style={styles.userinfo_subwrapper}>

              {/* username */}
              <Text style={styles.text_bold12}>@{this.state.username}</Text>

              <Text style={styles.text_black12}>{this.state.university}</Text>

              {this.state.major !== '' && <Text style={styles.text_black12}>{this.state.major}</Text>}

              {this.renderFiveStar(this.state.star, 10, 5)}
              <View style={styles.f_row}>

                <Text style={[styles.text_bold12, { lineHeight: followbarheight }]}>{this.state.numOfFollowers} </Text>

                <TouchableOpacity onPress={this.pressFollowView.bind(this, true)} style={styles.followbtns_wrapper}>
                  <Text style={[styles.text_regular12, { lineHeight: followbarheight }]}>followers</Text>
                </TouchableOpacity>

                <Text style={[styles.text_bold12, { lineHeight: followbarheight }]}>   {this.state.numOfFollowings} </Text>

                <TouchableOpacity onPress={this.pressFollowView.bind(this, false)} style={styles.followbtns_wrapper}>
                  <Text style={[styles.text_regular12, { lineHeight: followbarheight }]}>following</Text>
                </TouchableOpacity>

              </View>

              <TouchableOpacity onPress={this.pressFollow.bind(this)} style={styles.followbtn_wrapper}>
                <Text style={styles.followbtn_text}>{this.state.includeMeInFollowers ? 'following' : 'follow'}</Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

        <View style={styles.space3}></View>

        {/* 2 blue buttons */}
        <View style={styles.screenbtn_container}>

          <TouchableOpacity onPress={this.pressSubScreen.bind(this, 1)} style={styles.storebtn_wrapper}>

            <View style={styles.storebtn_subwrapper}>
              <View style={styles.storetext_wrapper}>
                <Text style={styles.screenbtns_text}>store </Text>
                <Ionicons name="md-arrow-dropdown" size={16} color={'white'} />
                {/* <View style={{ top: -3 }}>
                  <FontAwesome name="sort-down" size={16} color={'white'} />
                </View> */}
              </View>
              <View style={{ top: horizontalButtonLineTop, height: 1, backgroundColor: this.state.screenindex === 1 ? 'white' : Global.colorButtonBlue }}></View>
            </View>

            <Modal
              visible={this.state.modalVisible}
              animationType={"fade"}
              onRequestClose={() => { this.state.modalVisible(false); }}
              transparent >

              <TouchableOpacity onPress={() => { this.setState({ modalVisible: false }) }} style={styles.modal_container}>

                <View style={styles.modal_wrapper}>

                  {storeCategoryItems.map((item, index) => {
                    const itemIndex = index === 0 ? 1 : index + 3;
                    return (
                      <TouchableOpacity key={index} onPress={this.pressModalItem.bind(this, itemIndex)} style={styles.modal_item}>
                        <Text style={[styles.text_black16, { color: this.state.storescreenindex === itemIndex ? Global.colorButtonBlue : 'black' }]}>{item}</Text>
                      </TouchableOpacity>
                    )
                  })
                  }

                </View>

              </TouchableOpacity>
            </Modal>

          </TouchableOpacity>

          <TouchableOpacity onPress={this.pressSubScreen.bind(this, 3)} style={styles.reviewsbtn_wrapper}>

            <View style={styles.reviewsbtn_subwrapper}>
              <Text style={styles.screenbtns_text}>reviews</Text>
              <View style={{ top: horizontalButtonLineTop, height: 1, backgroundColor: this.state.screenindex === 3 ? 'white' : Global.colorButtonBlue }}></View>
            </View>
          </TouchableOpacity>

        </View>


        {/* store, liked, review content */}
        <View style={styles.storereview_area}>
          {this.state.screenindex !== 3 ? this.render_storeOrlike() : this.render_review()}
        </View>

        {/* {this.state.vacation &&
          <View style={{ position: 'absolute', bottom: Global.TabBarHeight, width: '100%', height: '10%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: Global.Nimbus_Black, fontSize: 22, lineHeight: 22 }}>check back in on</Text>
            <Text style={{ fontFamily: Global.Nimbus_Black, fontSize: 22, lineHeight: 22 }}>{vacation_month} {vacation_date}!</Text>
          </View>
        } */}

      </View>

    );
  }
}

export default withNavigationFocus(OtherProfile);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  item_container: {
    marginTop: itemSpace,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  item_image: {
    height: "100%",
    width: "100%"
  },
  item_imagewrapper: {
    width: imageItemWidth,
    height: imageItemWidth
  },
  item_soldback: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colorSoldBack
  },
  text_bold10: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 10
  },
  text_bold11: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 11
  },
  text_bold15: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    color: "white"
  },
  text_bold12: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12
  },
  text_regular12: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 12
  },
  text_regular11: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 11
  },
  text_black12: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 12
  },
  text_black13: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 13
  },
  text_black16: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16
  },
  text_black22: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 22
  },
  item_commentwrapper: {
    marginTop: 3,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5
  },
  item_leftcommentwrapper: {
    flexDirection: "row"
  },
  followbtn_text: {
    lineHeight: Math.round(Global.screenWidth * 0.05),
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12,
    color: "white"
  },
  followbtn_wrapper: {
    marginTop: 5,
    width: Math.round(Global.screenWidth * 0.18),
    height: Math.round(Global.screenWidth * 0.05),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colorButtonBlue
  },
  userinfo_container: {
    flex: 0.63,
    height: avatarWidth,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  store_container: {
    width: "100%"
  },
  store_contentcontainer: {
    alignItems: "center"
  },
  store_wrapper: {
    width: "94%"
  },
  reviewitem_container: {
    width: "96%",
    flexDirection: "row",
    marginBottom: Math.round(widthReviewAvatar / 4)
  },
  reviewitem_avatarwrapper: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  reviewitem_avatarsubwrapper: {
    width: widthReviewAvatar,
    height: widthReviewAvatar,
    borderRadius: Math.round(widthReviewAvatar / 2),
    overflow: "hidden"
  },
  reviewitem_avatar: {
    width: widthReviewAvatar,
    height: widthReviewAvatar
  },
  reviewitem_space1: {
    flex: 0.02
  },
  reviewitem_space2: {
    flex: 0.1
  },
  reviewitem_infowrapper: {
    flex: 0.45,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  reviewitem_timewrapper: {
    flex: 0.23,
    justifyContent: "center"
  },
  review_container: {
    width: "100%",
    flexDirection: "column",
    height: "100%"
  },
  review_headerwrapper: {
    width: "92%",
    alignSelf: "center",
    height: Global.screenHeight * 0.12,
    flexDirection: "column"
  },
  review_headerstarstext: {
    flex: 0.5,
    justifyContent: "flex-end"
  },
  review_headerstars: {
    flex: 0.25,
    justifyContent: "center"
  },
  review_countwrapper: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  topicons_wrapper: {
    height: Math.round(Global.screenHeight * 0.05),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  name: {
    height: Math.round(Global.screenHeight * 0.08),
    justifyContent: "center",
    alignItems: "center"
  },
  name_vacationhint: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 18,
    color: Global.colorButtonBlue
  },
  info_container: {
    height: Global.screenHeight * 0.17,
    flexDirection: "row"
  },
  space1: {
    flex: 0.08
  },
  space2: {
    flex: 0.02
  },
  avatar_wrapper: {
    flex: 0.27,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar_subwrapper: {
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
  space3: {
    height: Math.round(Global.screenHeight * 0.01)
  },
  screenbtn_container: {
    height: blueButtonsHeight,
    flexDirection: "row",
    alignItems: "center"
  },
  storebtn_wrapper: {
    flex: 1,
    height: "100%",
    borderRightColor: "white",
    borderRightWidth: 1,
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  storebtn_subwrapper: {
    flexDirection: "column"
  },
  storetext_wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  screenbtns_text: {
    lineHeight: blueButtonsHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15
  },
  modal_container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "#ffffff88"
  },
  modal_wrapper: {
    top: storeModalTop,
    width: 0.33 * Global.screenWidth,
    height: 200,
    backgroundColor: "white",
    borderRadius: 5,
    flexDirection: "column"
  },
  modal_item: {
    flex: 1 / storeCategoryItems.length,
    justifyContent: "center",
    alignItems: "center"
  },
  reviewsbtn_wrapper: {
    flex: 1,
    height: "100%",
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  reviewsbtn_subwrapper: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "center"
  },
  storereview_area: {
    width: "100%",
    height: Global.screenHeight * 0.65 - Global.TabBarHeight,
    flexDirection: "column"
  },
  userinfo_subwrapper: {
    height: "85%",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  w100: {
    width: "100%"
  },
  indicator: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  mailicon_wrapper: {
    height: "100%",
    alignItems: "flex-end",
    paddingRight: "3%"
  },
  f_row: {
    flexDirection: "row"
  },
  followbtns_wrapper: {
    paddingHorizontal: 5,
    backgroundColor: "darkgray",
    borderRadius: 10,
    justifyContent: "center",
    height: followbarheight
  }
});