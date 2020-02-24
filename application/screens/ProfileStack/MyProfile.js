import React, { Component } from 'react';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { TouchableOpacity, View, Image, StyleSheet, Text, ScrollView, FlatList, ActivityIndicator, Modal, Platform, SafeAreaView } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const imageItemWidth = Math.round(Global.screenWidth * 0.94 * 0.32);
const itemSpace = Math.round(Global.screenWidth * 0.94 * 0.02);
const avatarWidth = Math.round(Global.screenWidth * 0.27);
const widthReviewAvatar = Math.round(Global.screenWidth * 0.15);
const storeModalTop = Math.round(Global.screenHeight * 0.36);
const topThreeIconsHeight = Math.round(Global.screenHeight * 0.05);
const blueButtonsHeight = Math.round(Global.screenHeight * 0.04);
const horizontalButtonLineTop = - Math.round(blueButtonsHeight * 0.25);
const storeCategoryItems = ['all', 'clothes', 'tech', 'home', 'books', 'other'];
const followbarheight = 15;

class Profile extends Component { // 'MyProfileScreen'

  static navigationOptions = ({ navigation }) => ({
    header: null,
  });

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      username: '',
      avatar: '',
      userNameAndAvatarsAsUid: {},
      star: 0,
      university: '',
      major: '',
      gender: 0,
      vacation: false,
      numOfFollowers: 0,
      numOfFollowings: 0,
      includeMeInFollowers: false,
      screenindex: 1,         // 1:store, 2:liked, 3:reviews
      storesubscreenindex: 1, // 1~6
      loadingImage: true,
      storeOrlikeArray: [],
      modalVisible: false,
      isIphoneX: false,
    }
    this.getMyStoreOrLikedData = this.getMyStoreOrLikedData.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.isFocused) {
      this.getUserProfile();
      const { params } = this.props.navigation.state;
      if (params && params.from) {
        if (params.from === 'HomeScreen') {
          this.setState({
            screenindex: 2, // liked
          })
        } else if (params.from === 'SellScreen') {
          this.setState({
            screenindex: 1,
            storesubscreenindex: 1,
          })
        }
      }
      if (this.state.screenindex === 3) return;
      this.getMyStoreOrLikedData(this.state.screenindex)
    }
  }

  componentWillUnmount() {
    this.setState({ modalVisible: false })
  }

  getUserProfile() {
    Fire.shared.getUserProfile().then((res) => {
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
          numOfFollowers: listFollowers.length || 0,
          numOfFollowings: listFollowings.length || 0,
          review: res.review,
          star: star,
          userNameAndAvatarsAsUid: userNameAndAvatarsAsUid,
        });
      })
    }).catch((err) => Global.isDev && console.log(err))
  }

  pressModalItem(index) { // 4~8: clothes, tech, home, books, other
    this.setState({ modalVisible: false, storesubscreenindex: index, screenindex: 1 });
    this.getMyStoreOrLikedData(index);
  }

  pressSetting() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'SettingScreen',
      params: {
        vacation: this.state.vacation,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressSubScreen(index) {

    if (index === 1) {
      this.setState({
        modalVisible: true,
      })
    } else if (index === 2) {
      if (this.state.screenindex === 2) return;
      this.setState({
        screenindex: 2,
      })
      this.getMyStoreOrLikedData(2);
    } else if (index === 3) {
      if (this.state.screenindex === 3) return;
      this.setState({
        screenindex: 3,
      })
    }
  }

  getMyStoreOrLikedData(index) { // 1:store whole, 2: liked, 3:reviews, 4:clothes, 5:tech, 6:home, 7:books, 8:other
    this.setState({ loadingImage: true });
    Fire.shared.getMyStoreOrLikedData(index).then((res) => {
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
      this.setState({ storeOrlikeArray: tempArray, loadingImage: false });
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
      <View style={styles.f_row}>
        {stars}
      </View>
    );
  }

  pressFlatListItem(index, i) {
    const item = this.state.storeOrlikeArray[index][i];
    if (item.sold) return;
    const navigateAction = NavigationActions.navigate({
      routeName: 'FeedItemScreen',
      params: {
        from: 'MyProfileScreen',
        item: item
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }

  renderStoreLikeFlatlistItem(item, index) {
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
        <TouchableOpacity onPress={this.pressFlatListItem.bind(this, index, i)} key={i} style={[styles.store_item_wrapper, { marginLeft: i === 0 ? 0 : itemSpace }]}>

          <View style={styles.store_item_imagewrapper}>
            <Image source={{ uri: item[i].picture[0] }} style={styles.store_item_image} resizeMode='contain' />

            {sold &&
              <View style={styles.store_item_sold}>
                <Text style={styles.store_item_soldtext}>sold</Text>
              </View>
            }
          </View>

          <View style={styles.store_item_contentwrapper}>
            <View style={styles.store_item_firstparam}>
              <Text style={styles.text_bold10}>{firstItemTitle} </Text>
              <Text style={styles.text_black10}>{firstItemContent}</Text>
            </View>

            <Text style={styles.text_bold10}>${item[i].price}</Text>
          </View>

        </TouchableOpacity>
      )
    }
    return (
      <View style={styles.store_item_container}>
        {groupImages}
      </View>
    )
  }

  render_storeOrlike() {

    return (
      <View style={styles.storelikearea} contentContainerStyle={{ alignItems: 'center' }}>

        {this.state.loadingImage &&
          <View style={styles.indicator}>
            <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
          </View>
        }
        {!this.state.loadingImage &&
          <View style={styles.store_container}>
            <FlatList
              style={{ flex: 1 }}
              data={this.state.storeOrlikeArray}
              extraData={this.state}
              renderItem={({ item, index }) => this.renderStoreLikeFlatlistItem(item, index)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        }
      </View>
    )
  }

  renderReviewFlatListItem(item) {

    if (isEmpty(this.state.userNameAndAvatarsAsUid[item.uid])) return;

    return (
      <View style={styles.review_items_container}>

        <View style={styles.review_items_avatarwrapper}>
          <View style={styles.review_items_avatarsubwrapper}>
            <Image
              source={{ uri: this.state.userNameAndAvatarsAsUid[item.uid].avatar }}
              style={styles.review_items_avatar}
              resizeMode='contain' />
          </View>
        </View>

        <View style={styles.review_items_space1}></View>

        <View style={styles.review_items_starwrapper}>

          {this.renderFiveStar(item.star, 10, 5)}
          <Text style={[styles.text_regular11, { marginTop: Platform.OS === "ios" ? 5 : 0 }]}>@{this.state.userNameAndAvatarsAsUid[item.uid].username}</Text>
          <Text style={styles.text_regular11}>"{item.text}"</Text>

        </View>

        <View style={styles.review_items_space2}></View>

        <View style={styles.review_items_timewrapper}>
          <Text style={styles.text_bold11}>{item.time}</Text>
        </View>

      </View>
    )
  }

  render_review() {
    const countReview = this.state.review && this.state.review.length || 0;
    if (isEmpty(countReview)) return;

    return (

      <View style={styles.review_container}>

        <View style={styles.review_topcontainer}>
          <View style={styles.review_topstartext}>
            <Text style={styles.text_black13}>{this.state.star} stars</Text>
          </View>
          <View style={styles.review_topstarimage}>
            {this.renderFiveStar(this.state.star, 12, 10)}
          </View>
          <View style={styles.review_topreviewtext}>
            <Text style={styles.text_black13}>{countReview} reviews</Text>
          </View>
        </View>

        {countReview !== 0 &&
          <Image
            source={require('@images/line_profilereview.png')}
            style={styles.review_lineimage}
            resizeMode='contain' />
        }
        {countReview !== 0 &&
          <ScrollView style={styles.review_itemswrapper} >

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

  getIsIphoneX(event) {
    const { y } = event.nativeEvent.layout;
    if (y > 40) {
      this.setState({ isIphoneX: true });
    }
  }
  pressFollowView(isFollowers) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'FollowViewScreen',
      params: {
        from: 'MyProfileScreen',
        isFollowers: isFollowers,
        uid: Fire.shared.uid,
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }
  render() {
    const avatar = this.state.avatar !== '' ? { uri: this.state.avatar } : require('@images/avatar.png');

    let vacation_month = '', vacation_date = '';
    if (this.state.vacation) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      // 08/31/2019
      vacation_month = months[parseInt(this.state.vacationBackDate.substring(0, 2) - 1)]
      vacation_date = parseInt(this.state.vacationBackDate.substring(3, 5))
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: this.state.vacation ? Global.colorPink : 'white' }]}>

        <View onLayout={(event) => this.getIsIphoneX(event)} style={[styles.screencontainer, { paddingBottom: this.state.isIphoneX ? Global.TabBarHeight - 34 : Global.TabBarHeight }]}>

          {/* top three icons */}
          <View style={[styles.topicons_wrapper, { alignItems: this.state.isIphoneX ? 'flex-start' : 'flex-end' }]}>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('NotificationScreen')}
              style={styles.topicons_btnwrapper} >
              <Image
                source={require('@images/ring.png')}
                style={styles.topicons_image}
                resizeMode='contain'
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('MyAccountScreen')}
              style={styles.topicons_btnwrapper} >
              <Image
                source={require('@images/coin-icon.png')}
                style={styles.topicons_image}
                resizeMode='contain'
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.pressSetting.bind(this)}
              style={styles.topicons_btnwrapper} >
              <Image
                source={require('@images/settings.png')}
                style={styles.topicons_image}
                resizeMode='contain'
              />
            </TouchableOpacity>

          </View>

          {/* name */}
          <View style={styles.name_wrapper}>
            <Text style={styles.text_black22}>{this.state.name}</Text>
            {this.state.vacation &&
              <Text style={styles.name_vacationhint}>is on vacation.</Text>
            }

          </View>

          {/* avatar and info */}
          <View style={styles.avatarinfo_wrapper}>

            <View style={styles.space1}></View>

            <View style={styles.avatar_wrapper}>
              <View style={[styles.avatarimage, { overflow: 'hidden' }]}>
                <Image
                  source={avatar}
                  style={styles.avatarimage}
                  resizeMode='contain' />
              </View>

            </View>

            <View style={styles.space2}></View>

            <View style={styles.userinfo_wrapper}>

              {/* user info */}
              <View style={styles.userinfo_subwrapper}>
                <Text style={styles.text_bold12}>@{this.state.username}</Text>

                <Text style={styles.text_black12}>{this.state.university}</Text>

                {this.state.major !== '' &&
                  <Text style={styles.text_black12}>{this.state.major}</Text>
                }

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

              </View>

            </View>

          </View>

          <View style={styles.space3}></View>

          {/* 3 blue buttons */}
          <View style={styles.screenbar_wrapper}>

            <TouchableOpacity onPress={this.pressSubScreen.bind(this, 1)} style={[styles.buttonsbar_itemwrapper, { borderRightColor: 'white', borderRightWidth: 1 }]}>

              <View style={styles.storebtn_container}>
                <View style={styles.storebtn_wrapper}>
                  <Text style={styles.storebtn_text}>store </Text>
                  <Ionicons name="md-arrow-dropdown" size={16} color={'white'} />
                </View>

                <View style={[styles.likedreviews_btnline, { backgroundColor: this.state.screenindex === 1 ? 'white' : Global.colorButtonBlue }]}></View>
              </View>


              <Modal
                visible={this.state.modalVisible}
                animationType={"fade"}
                onRequestClose={() => { this.state.modalVisible(false); }}
                transparent >

                <TouchableOpacity onPress={() => { this.setState({ modalVisible: false }) }} style={styles.modal_wrapper}>

                  <View style={[styles.modal_subwrapper, { top: this.state.isIphoneX ? storeModalTop + 44 : storeModalTop }]}>

                    {storeCategoryItems.map((item, index) => {
                      const itemIndex = index === 0 ? 1 : index + 3;
                      return (
                        <TouchableOpacity key={index} onPress={this.pressModalItem.bind(this, itemIndex)} style={styles.modal_itemwrapper}>
                          <Text style={[styles.text_black16, { color: this.state.storesubscreenindex === itemIndex ? Global.colorButtonBlue : 'black' }]}>{item}</Text>
                        </TouchableOpacity>
                      )
                    })
                    }

                  </View>

                </TouchableOpacity>
              </Modal>

            </TouchableOpacity>


            <TouchableOpacity onPress={this.pressSubScreen.bind(this, 2)} style={[styles.buttonsbar_itemwrapper, { borderRightColor: 'white', borderRightWidth: 1 }]}>

              <View style={styles.likedreviews_btnwrapper}>
                <Text style={styles.likedreviews_btntext}>liked</Text>
                <View style={[styles.likedreviews_btnline, { backgroundColor: this.state.screenindex === 2 ? 'white' : Global.colorButtonBlue }]}></View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.pressSubScreen.bind(this, 3)} style={styles.buttonsbar_itemwrapper}>

              <View style={styles.likedreviews_btnwrapper}>
                <Text style={styles.likedreviews_btntext}>reviews</Text>
                <View style={[styles.likedreviews_btnline, { backgroundColor: this.state.screenindex === 3 ? 'white' : Global.colorButtonBlue }]}></View>
              </View>
            </TouchableOpacity>

          </View>


          {/* store, liked, review */}
          <ScrollView style={styles.sub_container}>
            {this.state.screenindex === 3 ? this.render_review() : this.render_storeOrlike()}
          </ScrollView>

          {this.state.vacation &&
            <View style={styles.vacation_bottomtext_wrapper}>
              <Text style={styles.text_black22}>check back in on</Text>
              <Text style={styles.text_black22}>{vacation_month} {vacation_date}!</Text>
            </View>
          }

        </View>
      </SafeAreaView>

    );
  }
}

export default withNavigationFocus(Profile);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  screencontainer: {
    width: "100%",
    height: "100%",
  },
  topicons_wrapper: {
    height: topThreeIconsHeight,
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text_black10: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 10
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
  text_bold10: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 10
  },
  text_bold11: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 11
  },
  text_bold12: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12
  },
  text_regular11: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 11
  },
  text_regular12: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 12
  },
  topicons_image: {
    height: "100%",
    width: "100%"
  },
  topicons_btnwrapper: {
    width: Math.round(Global.screenWidth * 0.07),
    height: "80%"
  },
  name_wrapper: {
    height: Math.round(Global.screenHeight * 0.08),
    justifyContent: "center",
    alignItems: "center"
  },
  name_vacationhint: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 18,
    color: Global.colorButtonBlue
  },
  avatarinfo_wrapper: {
    height: Global.screenHeight * 0.17,
    flexDirection: "row"
  },
  space1: {
    flex: 0.08
  },
  space2: {
    flex: 0.02
  },
  space3: {
    height: Math.round(Global.screenHeight * 0.01)
  },
  avatar_wrapper: {
    flex: 0.27,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarimage: {
    width: avatarWidth,
    height: avatarWidth,
    borderRadius: Math.round(avatarWidth / 2)
  },
  userinfo_wrapper: {
    flex: 0.63,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  screenbar_wrapper: {
    height: blueButtonsHeight,
    flexDirection: "row",
    alignItems: "center"
  },
  storebtn_container: {
    flexDirection: "column"
  },
  storebtn_wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  storebtn_text: {
    lineHeight: blueButtonsHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15
  },
  modal_itemwrapper: {
    flex: 1 / storeCategoryItems.length,
    justifyContent: "center",
    alignItems: "center"
  },
  modal_subwrapper: {
    width: 0.33 * Global.screenWidth,
    height: 200,
    backgroundColor: "white",
    borderRadius: 5,
    flexDirection: "column"
  },
  modal_wrapper: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "#ffffff88"
  },
  likedreviews_btnline: {
    top: horizontalButtonLineTop,
    height: 1
  },
  likedreviews_btntext: {
    lineHeight: blueButtonsHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15
  },
  likedreviews_btnwrapper: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "center"
  },
  buttonsbar_itemwrapper: {
    flex: 1,
    height: "100%",
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  sub_container: {
    width: "100%",
    flexDirection: "column"
  },
  vacation_bottomtext_wrapper: {
    position: "absolute",
    bottom: Global.TabBarHeight,
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  review_container: {
    width: "100%",
    flexDirection: "column"
  },
  review_topcontainer: {
    width: "92%",
    alignSelf: "center",
    height: Global.screenHeight * 0.12,
    flexDirection: "column"
  },
  review_topstartext: {
    flex: 0.5,
    justifyContent: "flex-end"
  },
  review_topstarimage: {
    flex: 0.25,
    justifyContent: "center"
  },
  review_topreviewtext: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  review_lineimage: {
    width: "100%"
  },
  review_itemswrapper: {
    width: "100%"
  },
  review_items_container: {
    width: "100%",
    flexDirection: "row",
    marginBottom: Math.round(widthReviewAvatar / 4)
  },
  review_items_avatarwrapper: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  review_items_avatarsubwrapper: {
    width: widthReviewAvatar,
    height: widthReviewAvatar,
    borderRadius: Math.round(widthReviewAvatar / 2),
    overflow: "hidden"
  },
  review_items_avatar: {
    width: widthReviewAvatar,
    height: widthReviewAvatar
  },
  review_items_space1: {
    flex: 0.02
  },
  review_items_space2: {
    flex: 0.1
  },
  review_items_starwrapper: {
    flex: 0.45,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  review_items_timewrapper: {
    flex: 0.23,
    justifyContent: "center"
  },
  indicator: {
    width: "100%",
    height: imageItemWidth,
    justifyContent: "center",
    alignItems: "center"
  },
  store_container: {
    flex: 1,
    width: '100%',
  },
  store_item_container: {
    alignSelf: "center",
    marginTop: itemSpace,
    width: "94%",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  store_item_wrapper: {
    width: imageItemWidth,
    flexDirection: "column"
  },
  store_item_imagewrapper: {
    width: imageItemWidth,
    height: imageItemWidth
  },
  store_item_image: {
    height: "100%",
    width: "100%"
  },
  store_item_sold: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colorSoldBack
  },
  store_item_soldtext: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    color: "white"
  },
  store_item_contentwrapper: {
    marginTop: 3,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5
  },
  store_item_firstparam: {
    flexDirection: "row"
  },
  userinfo_subwrapper: {
    height: "70%",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  storelikearea: {
    width: '100%'
  },
  f_row: {
    flexDirection: 'row'
  },
  followbtns_wrapper: {
    paddingHorizontal: 5,
    backgroundColor: 'darkgray',
    borderRadius: 10,
    justifyContent: 'center',
    height: followbarheight
  }
});