import React, { Component } from 'react';
import { View, TouchableOpacity, Text, Image, TextInput, ScrollView, FlatList, ActivityIndicator, PanResponder, StyleSheet, Modal } from 'react-native';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const buttonsHeight = Math.round(Global.screenWidth * 0.08);
const imageItemWidth = Math.round(Global.screenWidth * 0.295);
const marginTopFlatList = Math.round(Global.screenWidth * 0.02);
const itemSpace = Math.round((Global.screenWidth * 0.95 - imageItemWidth * 3) / 2);
const searchradiuswidth = Math.round(Global.screenWidth * 0.3978);
const colorImageBack = '#cccccc';
const searchCategoryItems = ['clothes', 'tech', 'home', 'books', 'other', 'people'];
const categoryBarHeight = Math.round(Global.screenWidth * 0.08);
const horizontalButtonLineTop = - Math.round(categoryBarHeight * 0.25);

class Search extends Component { // 'SearchScreen'
  static navigationOptions = ({ navigation }) => ({
    header: null,
  });

  constructor(props) {
    super(props);
    this.state = {
      category: 1, //1~6
      clothesGender: 3, //1~3 men's women's unisex
      modalVisible: false,

      loading: true,
      searchText: '',
      searchRadiusWidthPercent: 50,
      searchRadius: 5, //miles
      limitCampus: true,

      textSearchArray: [],
      hotArray: [], // use only one picture
      newArray: [],
      personArray: [],
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
      },
      onPanResponderMove: (evt, gestureState) => {
        let newSearchRadiusViewWidthPercent = this.state.searchRadiusWidthPercent + Math.round(gestureState.dx * 100 / searchradiuswidth);
        if (newSearchRadiusViewWidthPercent >= 100) {
          newSearchRadiusViewWidthPercent = 100;
        } else if (newSearchRadiusViewWidthPercent < 10) {
          newSearchRadiusViewWidthPercent = 10;
        }
        const searchRadius = newSearchRadiusViewWidthPercent / 10;
        this.setState({ searchRadius: searchRadius });

        this.viewSearchRadius.setNativeProps({ width: newSearchRadiusViewWidthPercent.toString() + '%' });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        let newSearchRadiusViewWidthPercent = this.state.searchRadiusWidthPercent + Math.round(gestureState.dx * 100 / searchradiuswidth);
        if (newSearchRadiusViewWidthPercent >= 100) {
          newSearchRadiusViewWidthPercent = 100;
        } else if (newSearchRadiusViewWidthPercent < 10) {
          newSearchRadiusViewWidthPercent = 10;
        }
        this.setState({ searchRadiusWidthPercent: newSearchRadiusViewWidthPercent });
        this.goSearch(this.state.searchText, this.state.category, this.state.searchRadius, this.state.limitCampus);
      },
      onPanResponderTerminate: (evt, gestureState) => {
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    });

    this.goSearch = this.goSearch.bind(this);
  }

  componentDidMount() {
    this.goSearch('', 1, 5, true)
  }
  // componentWillReceiveProps(nextprops) {
  //   // Global.isDev && console.log('-----------search componentWillReceiveProps');
  //   // if (nextprops.isFocused) {
  //   //   this.setState({
  //   //     category: 1,
  //   //     clothesGender: 3,
  //   //     // showTextSearchScreen: false,
  //   //     loadingTextSearch: false,
  //   //     searchText: '',
  //   //     searchRadiusWidthPercent: 50,
  //   //     searchRadius: 5,
  //   //     limitCampus: true,
  //   //     // loadingHot: true,
  //   //     // loadingNew: true,
  //   //     loading: true,
  //   //     textSearchArray: [],
  //   //     hotArray: [], // use only one picture
  //   //     newArray: [],
  //   //   })

  //   //   // this.getHotTodayOnClick(1, 3);
  //   //   // this.getNewPostOnClick(1, 3);
  //   //   this.goSearch('', 1, 5, true)
  //   // }
  // }

  focusOnSearch() {
  }

  changeToThreeGroupArray(array) {
    let tempArray = [];
    const tempArrayCount = Math.ceil(array.length / 3)
    for (let i = 0; i < tempArrayCount; i++) {
      let threeArray = [];
      threeArray.push(array[i * 3]);
      if (i * 3 + 1 < array.length) threeArray.push(array[i * 3 + 1]);
      if (i * 3 + 2 < array.length) threeArray.push(array[i * 3 + 2]);
      tempArray.push(threeArray);
    }
    return tempArray;
  }

  goSearch = (searchText, searchCategory, searchRadius, searchCampus, gender = 3) => {
    this.setState({ loading: true });
    const searchtext = searchText.trim();
    Fire.shared.getSearchData(searchtext, searchCategory, searchRadius, searchCampus, gender).then((res) => {
      if (isEmpty(res)) {
        this.setState({
          hotArray: [[{}, {}, {}], [{}, {}, {}]],
          newArray: [[{}, {}, {}], [{}, {}, {}]],
          personArray: [],
          loading: false,
        })
        return;
      }

      if (this.state.category === 6) { // person search
        const personArray = this.changeToThreeGroupArray(res);
        this.setState({
          personArray: personArray,
          loading: false,
        })
        return;
      }
      
      const tempHotArray = this.changeToThreeGroupArray(res.hot);
      const tempNewArray = this.changeToThreeGroupArray(res.new);

      this.setState({ hotArray: tempHotArray, newArray: tempNewArray, loading: false });
    }).catch((err) => {
      this.setState({
        loading: false,
      })
    })
  }

  pressCampus = () => {
    const newCampus = !this.state.limitCampus;
    this.setState({ limitCampus: newCampus })
    this.goSearch(this.state.searchText, this.state.category, this.state.searchRadius, newCampus);
  }


  pressSearchItem(index, i, type) {
    let item = {};
    if (type === 'hot') {
      item = this.state.hotArray[index][i];
    } else if (type === 'new') {
      item = this.state.newArray[index][i];
    } else if (type === 'person') {
      item = this.state.personArray[index][i];
    }
    if (isEmpty(item)) return;
    if (type === 'person') {
      const navigateAction = NavigationActions.navigate({
        routeName: 'OtherProfileScreen',
        params: {
          from: 'SearchScreen',
          uid: item.uid
        },
      });
      this.props.navigation.dispatch(navigateAction);
    } else {
      if (item.sold) return;
      const navigateAction = NavigationActions.navigate({
        routeName: 'FeedItemScreen',
        params: {
          from: 'SearchScreen',
          item: item
        },
      });
      this.props.navigation.dispatch(navigateAction);
    }
  }

  renderSearchFlatListItem(item, index, type) {
    let groupImages = [];
    for (let i = 0; i < item.length; i++) {
      if (type === 'person') {
        groupImages.push(
          <View key={i} style={[styles.item_person_imagewrapper, { marginLeft: i === 0 ? 0 : itemSpace }]}>
            <TouchableOpacity onPress={this.pressSearchItem.bind(this, index, i, type)} style={styles.item_person_imagesubwrapper}>
              <Image
                source={{ uri: item[i] && item[i].avatar || '' }}
                style={styles.item_person_image}
                resizeMode='contain' />
            </TouchableOpacity>
            <Text style={styles.text_bold13}>{item[i].name}</Text>
            <TouchableOpacity onPress={this.pressSearchItem.bind(this, index, i, type)}>
              <Text style={styles.text_regular12}>@{item[i].username}</Text>
            </TouchableOpacity>

          </View>
        )
      } else {
        const sold = item[i] && item[i].sold ? item[i].sold : false;
        groupImages.push(
          <TouchableOpacity onPress={this.pressSearchItem.bind(this, index, i, type)} key={i} style={[styles.item_wrapper, { marginLeft: i === 0 ? 0 : itemSpace }]}>
            {isEmpty(item[i]) &&
              <View style={styles.item_empty}></View>
            }
            {!isEmpty(item[i]) &&
              <Image
                source={{ uri: item[i] && item[i].picture && item[i].picture[0] || '' }}
                style={styles.item_image}
                resizeMode='contain' />
            }
            {(!isEmpty(item[i]) && sold) &&
              <View style={styles.item_soldwrapper}>
                <Text style={styles.item_soldtext}>sold</Text>
              </View>
            }
          </TouchableOpacity>
        )
      }
    }
    return (
      <View style={styles.items_container}>
        <View style={styles.items_onelinewrapper}>
          {groupImages}
        </View>
      </View>
    )
  }

  pressShoppingBag() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'ActiveOrdersScreen',
      params: {
        from: 'SearchScreen'
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressCategoryCarrot() {
    this.setState({
      modalVisible: true
    })
  }

  pressModalItem(itemIndex) { // 1~6
    this.setState({
      modalVisible: false,
      category: itemIndex,
      searchText: '',
    })
    this.goSearch('', itemIndex, this.state.searchRadius, this.state.limitCampus);
  }

  renderSearchHeader() {
    const category = this.state.category;
    const searchItemPlaceholder = category === 4 ? 'type class code' : 'search ' + searchCategoryItems[category - 1];

    return (
      <View style={styles.header_container}>

        {/* search bar */}
        <View style={styles.header_wrapper}>

          <View style={styles.searchicon}>
            <Ionicons name="ios-search" size={25} color={'black'} />
          </View>

          <Modal
            visible={this.state.modalVisible}
            animationType={"fade"}
            onRequestClose={() => { this.state.modalVisible(false); }}
            transparent >

            <TouchableOpacity onPress={() => { this.setState({ modalVisible: false }) }} style={styles.modal_container}>

              <View style={styles.modal_wrapper}>

                {searchCategoryItems.map((item, index) => {
                  const itemIndex = index + 1;
                  return (
                    <TouchableOpacity key={index} onPress={this.pressModalItem.bind(this, itemIndex)} style={styles.modal_item}>
                      <Text style={[styles.modal_itemtext, { color: this.state.category === itemIndex ? Global.colorButtonBlue : 'black', borderBottomWidth: itemIndex === this.state.category ? 1 : 0 }]}>{item}</Text>
                    </TouchableOpacity>
                  )
                })
                }

              </View>

            </TouchableOpacity>
          </Modal>

          {/* search text input */}
          <View style={{ flex: 0.8 }}>
            <TextInput maxLength={Global.TM30} selectTextOnFocus={true} autoFocus={false} autoCapitalize='none' multiline={false} numberOfLines={1} placeholder={searchItemPlaceholder} placeholderTextColor={'black'} style={styles.searchtext_input} onChangeText={text => this.setState({ searchText: text })} value={this.state.searchText} onFocus={() => this.focusOnSearch()} returnKeyType="done" onSubmitEditing={() => this.goSearch(this.state.searchText, this.state.category, this.state.searchRadius, this.state.limitCampus)} />
          </View>

          {/* down carrot icon */}
          <TouchableOpacity onPress={this.pressCategoryCarrot.bind(this)} style={styles.carroticon}>
            <Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
          </TouchableOpacity>

        </View>


        {/* shopping-bag */}
        <TouchableOpacity style={styles.bagicon_wrapper} onPress={this.pressShoppingBag.bind(this)}>
          <View style={styles.bagicon_subwrapper}>
            <Image
              source={require('@images/shopping-bag.png')}
              style={styles.bagicon}
              resizeMode='contain' />
          </View>
        </TouchableOpacity>

      </View>
    )
  }


  renderRadiusAndCampusSelect() {

    return (
      < View style={styles.radiuscampus_container}>
        <View style={styles.radiuscampus_wrapper}>

          <View style={styles.radiuscampus_titlewrapper}>
            <View style={styles.radius_wrapper}>
              <Text style={styles.text_black12}>search radius (miles)</Text>
            </View>
            <View style={styles.campus_wrapper}>
              <Text style={styles.text_black12}>limit to campus?</Text>
            </View>
          </View>

          <View style={styles.radiuscampus_btnwrapper}>

            {/* radius button */}
            <View style={styles.radius_btnwrapper}>
              <View style={styles.radius_btnsubwrapper}>

                <View {...this._panResponder.panHandlers} ref={(view) => (this.viewSearchRadius = view)} style={styles.radiusbtn} >
                  <Text style={styles.radiuscampus_btntext}>{this.state.searchRadius}</Text>
                </View>

              </View>
            </View>

            {/* limit to campus */}
            <View style={styles.campus_btncontainer}>
              <TouchableOpacity
                onPress={this.pressCampus.bind(this)}
                style={[styles.campus_btnwrapper, { justifyContent: this.state.limitCampus ? 'flex-start' : 'flex-end' }]}>

                {this.state.limitCampus ?
                  <View style={styles.campusbtn}>
                    <Text style={styles.radiuscampus_btntext}>yes</Text>
                  </View>
                  :
                  <View style={styles.campusbtn}>
                    <Text style={styles.radiuscampus_btntext}>no</Text>
                  </View>
                }

              </TouchableOpacity>
            </View>

            <View style={styles.campus_space1}></View>

            {/* limit to campus text */}
            <View style={styles.campus_besidetext}>
              <Text style={styles.text_bold7}>*yes limits to your</Text>
              <Text style={styles.text_bold7}>school, no shows all</Text>
              <Text style={styles.text_bold7}>college students</Text>
            </View>

          </View>

          <View style={styles.radiuscampus_bottom}></View>
        </View>

      </View>
    )
  }
  pressClothesGender(index) { // 1~3
    this.setState({ clothesGender: index, loading: true });
    this.goSearch(this.state.searchText, 1, this.state.searchRadius, this.state.limitCampus, index);
  }


  render() {

    const category = this.state.category;
    const categoryBarTitle = searchCategoryItems[category - 1];

    return (
      <View style={styles.container}>

        <View style={styles.subcontainer}>

          {this.renderSearchHeader()}

          {/* category bar */}
          <View style={styles.categorybar_wrapper}>

            <Text style={styles.categorybar_title}>{categoryBarTitle}</Text>

            {/* select sex for clothes - men's women's unisex */}
            {category === 1 &&
              <View style={styles.clothescategory_wrapper}>
                <TouchableOpacity onPress={this.pressClothesGender.bind(this, 1)} style={styles.clothescagetory_btn}>
                  <Text style={styles.clothescategory_item}>men's</Text>
                  <View style={[styles.clothescategory_selectline, { backgroundColor: this.state.clothesGender === 1 ? 'white' : Global.colorButtonBlue }]}></View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.pressClothesGender.bind(this, 2)} style={styles.clothescagetory_btn}>
                  <Text style={styles.clothescategory_item}>women's</Text>
                  <View style={[styles.clothescategory_selectline, { backgroundColor: this.state.clothesGender === 2 ? 'white' : Global.colorButtonBlue }]}></View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.pressClothesGender.bind(this, 3)} style={styles.clothescagetory_btn}>
                  <Text style={styles.clothescategory_item}>unisex</Text>
                  <View style={[styles.clothescategory_selectline, { backgroundColor: this.state.clothesGender === 3 ? 'white' : Global.colorButtonBlue }]}></View>
                </TouchableOpacity>
              </View>
            }
          </View>

          {this.renderRadiusAndCampusSelect()}


          {/* searchview */}
          <ScrollView contentContainerStyle={styles.searchview_container}>

            {this.state.category === 6 ? // person search

              <View style={styles.searchview_wrapper}>

                <Text style={styles.text_black16}>new users</Text>

                {this.state.loading ?
                  <View style={styles.indicator_wrapper}>
                    <ActivityIndicator size="large" color="#f39c12" />
                  </View>
                  :
                  <FlatList
                    // style={this.props.style}
                    data={this.state.personArray}
                    extraData={this.state}
                    renderItem={({ item, index }) => this.renderSearchFlatListItem(item, index, 'person')}
                    keyExtractor={(item, index) => index.toString()}
                  />
                }

              </View>

              :

              <View style={styles.searchview_wrapper}>

                {/* hot on campus */}
                <Text style={styles.text_black16}>what's hot on campus</Text>

                {this.state.loading ?
                  <View style={styles.indicator_wrapper}>
                    <ActivityIndicator size="large" color="#f39c12" />
                  </View>
                  :
                  <FlatList
                    data={this.state.hotArray}
                    extraData={this.state}
                    renderItem={({ item, index }) => this.renderSearchFlatListItem(item, index, 'hot')}
                    keyExtractor={(item, index) => index.toString()}
                  />
                }

                {/* what's new */}
                <Text style={[styles.text_black16, { marginTop: marginTopFlatList }]}>what's new</Text>

                {this.state.loading ?
                  <View style={styles.indicator_wrapper}>
                    <ActivityIndicator size="large" color="#f39c12" />
                  </View>
                  :
                  <FlatList
                    data={this.state.newArray}
                    extraData={this.state}
                    renderItem={({ item, index }) => this.renderSearchFlatListItem(item, index, 'new')}
                    keyExtractor={(item, index) => index.toString()}
                  />
                }

              </View>
            }

          </ScrollView>

          <View style={{ height: Global.TabBarHeight }}></View>
        </View>
      </View>
    );
  }
}

export default withNavigationFocus(Search);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Global.colorGreen
  },
  subcontainer: {
    flex: 1,
    width: "100%",
    flexDirection: "column"
  },
  categorybar_wrapper: {
    marginTop: 5,
    backgroundColor: Global.colorButtonBlue,
    width: "100%",
    height: categoryBarHeight,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  categorybar_title: {
    lineHeight: categoryBarHeight,
    color: "white",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    paddingLeft: 20
  },
  clothescategory_wrapper: {
    height: categoryBarHeight,
    flexDirection: "row"
  },
  clothescagetory_btn: {
    marginRight: 15,
    flexDirection: "column"
  },
  clothescategory_item: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 13,
    color: "white",
    lineHeight: categoryBarHeight
  },
  clothescategory_selectline: {
    top: horizontalButtonLineTop,
    height: 1
  },
  searchview_container: {
    marginTop: 15,
    alignItems: "center"
  },
  searchview_wrapper: {
    width: "95%",
    flexDirection: "column"
  },
  indicator_wrapper: {
    width: "100%",
    height: imageItemWidth,
    justifyContent: "center",
    alignItems: "center"
  },
  radiuscampus_container: {
    width: "100%",
    height: buttonsHeight * 2,
    backgroundColor: "white",
    alignItems: "center"
  },
  radiuscampus_wrapper: {
    width: "90%",
    height: "100%",
    flexDirection: "column"
  },
  radiuscampus_titlewrapper: {
    flex: 0.4,
    flexDirection: "row",
    alignItems: "flex-end"
  },
  radius_wrapper: {
    flex: 0.52
  },
  campus_wrapper: {
    flex: 0.48
  },
  text_black12: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 12
  },
  radiuscampus_btnwrapper: {
    flex: 0.5,
    flexDirection: "row",
    alignItems: "center"
  },
  radius_btnwrapper: {
    flex: 0.52,
    justifyContent: "center"
  },
  radius_btnsubwrapper: {
    width: "85%",
    height: "60%",
    backgroundColor: "#dcdcdb",
    borderRadius: buttonsHeight * 0.5
  },
  radiusbtn: {
    width: "50%",
    height: "100%",
    borderRadius: buttonsHeight * 0.5,
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  radiuscampus_btntext: {
    lineHeight: buttonsHeight * 0.6,
    fontFamily: Global.Nimbus_Bold,
    fontSize: 11,
    color: "white"
  },
  campusbtn: {
    width: "60%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: buttonsHeight * 0.5,
    backgroundColor: Global.colorButtonBlue
  },
  campus_btnwrapper: {
    width: "100%",
    height: "60%",
    flexDirection: "row",
    backgroundColor: "#dcdcdb",
    borderRadius: buttonsHeight * 0.5
  },
  campus_btncontainer: {
    flex: 0.22,
    height: "100%",
    justifyContent: "center"
  },
  campus_besidetext: {
    flex: 0.24,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  text_bold7: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 7
  },
  campus_space1: {
    flex: 0.02
  },
  radiuscampus_bottom: {
    flex: 0.1
  },
  header_container: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    paddingLeft: "5%",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  header_wrapper: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "black",
    borderBottomWidth: 1
  },
  searchicon: {
    flex: 0.1
  },
  modal_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff88"
  },
  modal_wrapper: {
    width: Math.round(0.5 * Global.screenWidth),
    height: Math.round(Global.screenHeight * 0.4),
    backgroundColor: "white",
    borderRadius: 5,
    flexDirection: "column",
    paddingVertical: 10
  },
  modal_item: {
    flex: 1 / searchCategoryItems.length,
    justifyContent: "center",
    alignItems: "center"
  },
  modal_itemtext: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16,
    borderBottomColor: "black"
  },
  searchtext_input: {
    width: "100%",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    fontWeight: "normal"
  },
  carroticon: {
    flex: 0.1,
    alignItems: "flex-end",
    paddingRight: 5
  },
  bagicon_wrapper: {
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  bagicon_subwrapper: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center"
  },
  bagicon: {
    width: 30,
    height: 30
  },
  item_person_imagewrapper: {
    width: imageItemWidth,
    flexDirection: "column",
    alignItems: "center"
  },
  item_person_imagesubwrapper: {
    borderRadius: Math.round(imageItemWidth / 2),
    overflow: "hidden"
  },
  item_person_image: {
    width: imageItemWidth,
    height: imageItemWidth,
    borderRadius: Math.round(imageItemWidth / 2)
  },
  text_black16: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16
  },
  text_bold13: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 13
  },
  text_regular12: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 12
  },
  item_wrapper: {
    width: imageItemWidth,
    height: imageItemWidth
  },
  item_empty: {
    width: imageItemWidth,
    height: imageItemWidth,
    backgroundColor: colorImageBack
  },
  item_image: {
    width: imageItemWidth,
    height: "100%"
  },
  item_soldwrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colorSoldBack
  },
  item_soldtext: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 15,
    color: "white"
  },
  items_container: {
    marginTop: marginTopFlatList,
    marginBottom: marginTopFlatList,
    width: "95%",
    flexDirection: "row"
  },
  items_onelinewrapper: {
    width: "100%",
    flexDirection: "row"
  }
});