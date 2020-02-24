
import React, { Component } from 'react';
import { TouchableOpacity, View, Image, ScrollView, Text, TextInput, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import getPermission from '@utils/getPermission';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';

const headerHeight = Math.round(Global.screenWidth * 0.2);

const categories = ['clothes', 'tech', 'home', 'books', 'other'];
const genders = [`men's`, `women's`, 'unisex'];
const colorSet = [
  { name: 'red', color: "#ff0000" },
  { name: 'pink', color: "#ff00ff" },
  { name: 'orange', color: "#ff8c00" },
  { name: 'yellow', color: "#ffff00" },
  { name: 'green', color: "#00ff00" },
  { name: 'blue', color: "#0000ff" },
  { name: 'purple', color: "#a020f0" },
  { name: 'gold', color: "#ffd700" },
  { name: 'silver', color: "#D3D3D3" },
  { name: 'black', color: "#000000" },
  { name: 'gray', color: "#bebebe" },
  { name: 'white', color: "#ffffff" },
  { name: 'cream', color: "#ffe4e1" },
  { name: 'brown', color: "#8b4513" }
];


class Sell extends Component { // 'SellScreen'
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);

    this.state = {
      picture: ['', '', '', '', ''],
      title: '',
      description: '',
      price: '',
      earnings: 0, // float
      category: 0, // 0:no select, 1:clothes, 2:tech, 3:home, 4:books, 5:other
      brand: '', // or class code on books
      gender: 0, // no on category 2,3,4,5
      size: 0, // no on category 2,3,4,5
      color: 0, // no on category 4

      showBackArrow: false,
      showCategoryItems: false,
      showCategorySelectedItem: false,
      showGenderItems: false,
      showGenderSelectedItem: false,
      showSizeItems: false,
      showSizeSelectedItem: false,

      showGenderAndSize: true,
      showColorItem: true,
      showColorSetBox: false,

      showStripeConnect: false,
      connectingStripe: false,

      picturechanged: false,
      posting: false,

      editPostId: '',
    };
    this.initState = this.initState.bind(this);
    this.postProduct = this.postProduct.bind(this);
  }

  initState() {
    this.setState({
      picture: ['', '', '', '', ''],
      title: '',
      description: '',
      price: '',
      earnings: 0, // float
      category: 0, // 0:no select, 1:clothes, 2:tech, 3:home, 4:books, 5:other
      brand: '',   // or class code on books
      gender: 0,   // no on category 2,3,4,5
      size: 0,     // no on category 2,3,4,5
      color: 0,    // no on category 4

      showBackArrow: false,
      showCategoryItems: false,
      showCategorySelectedItem: false,
      showGenderItems: false,
      showGenderSelectedItem: false,
      showSizeItems: false,
      showSizeSelectedItem: false,

      showGenderAndSize: true,
      showColorItem: true,

      showColorSetBox: false,

      picturechanged: false,
      posting: false,
    });
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.isFocused) {
      const { params } = this.props.navigation.state;
      if (params) {
        if (this.state.editPostId === params.feedItem.postid) {
          this.props.navigation.pop();
          const navigateAction = NavigationActions.navigate({
            routeName: 'SellScreen',
          });
          this.props.navigation.dispatch(navigateAction);
          return;
        }
        this.setStateFromFeedItemEdit();
      } else {
        this.initState();
      }
    }
  }

  setStateFromFeedItemEdit() {
    const { params } = this.props.navigation.state;
    const feedItem = params.feedItem;
    let picture = ['', '', '', '', ''];
    for (let i = 0; i < feedItem.picture.length; i++) {
      picture[i] = feedItem.picture[i];
    }
    const earnings = parseInt(feedItem.price) - parseInt(feedItem.price) / 20;
    const category = feedItem.category;
    this.setState({
      picture: picture || [],
      title: feedItem.title,
      description: feedItem.description,
      price: feedItem.price,
      earnings: earnings, // float
      category: feedItem.category, // 0:no select, 1:clothes, 2:tech, 3:home, 4:books, 5:other
      brand: feedItem.brand, // or class code on books
      gender: feedItem.gender || 0, // no on category 2,3,4,5
      size: feedItem.size || 0, // no on category 2,3,4,5
      color: feedItem.color || 0, // no on category 4

      showBackArrow: true,
      showCategoryItems: false,
      showCategorySelectedItem: true,
      showGenderItems: false,
      showGenderSelectedItem: category === 1 ? true : false,
      showSizeItems: false,
      showSizeSelectedItem: category === 1 ? true : false,
      showGenderAndSize: category === 1 ? true : false,
      showColorItem: category !== 4 ? true : false,
      showColorSetBox: false,
      editPostId: feedItem.postid,
    })
  }

  pressArrow() {
    this.props.navigation.goBack();
  }
  pressPicture(itemindex) {
    this.selectPhoto(itemindex);
  }

  selectPhoto = async (itemindex) => {
    const options = {
      allowsEditing: true,
      aspect: [3, 3],
    };
    let picture = this.state.picture;
    const status = await getPermission(Permissions.CAMERA_ROLL);
    if (status) {
      const result = await ImagePicker.launchImageLibraryAsync(options);
      if (!result.cancelled) {
        this.setState({ picturechanged: true });
        picture[itemindex] = result.uri;
        this.setState({ picture: picture });
      }
    }
  };

  changePrice(text) {
    if (text === '' || text === '$' || text === '$ ') { // delete
      this.setState({ price: '', earnings: 0 });
      return;
    }
    if (text.length === 1) {
      if (this.isNumeric(text)) {
        const earnings = parseInt(text) - parseInt(text) * 5 / 100 - parseInt(text) * 29 / 1000 - 0.3;
        this.setState({ price: text, earnings: earnings });
        return;
      } else {
        return;
      }
    } else {
      let arraybydot = text.split(".");
      if (arraybydot.length > 2) { // check dot
        Toast.show({ text: Strings.ST36, position: 'bottom', duration: Global.ToastDuration })
        return;
      } else if (arraybydot.length == 2) {
        if (arraybydot[1].length > 1) {
          return;
        }
      }
      let arraybyspace = text.split(" ");
      if (arraybyspace.length > 2) { // check space
        Toast.show({ text: Strings.ST36, position: 'bottom', duration: Global.ToastDuration })
        return;
      }
      if (!this.isNumeric(arraybyspace[1])) { // check character
        Toast.show({ text: Strings.ST36, position: 'bottom', duration: Global.ToastDuration })
        return;
      }
      let earnings = parseFloat(arraybyspace[1]) - parseFloat(arraybyspace[1]) * 5 / 100 - parseFloat(arraybyspace[1]) * 29 / 1000 - 0.3;
      earnings = earnings.toFixed(2);
      this.setState({
        price: arraybyspace[1], earnings: earnings
      })
    }
  }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  pressPost() {
    if (this.state.posting) return;
    this.setState({
      posting: true
    })

    // check stripe connect
    Fire.shared.getSellerAccountId(Fire.shared.uid).then((myStripeAccountId) => {
      if (isEmpty(myStripeAccountId)) {
        Toast.show({ text: Strings.ST43, position: 'bottom', duration: Global.ToastDuration });
        this.setState({
          showStripeConnect: true
        })
      } else {
        this.postProduct();
      }
    }).catch(() => this.setState({ posting: false }))
  }

  postProduct() {

    let picture = [];
    for (let i = 0; i < 5; i++) {
      if (this.state.picture[i] !== '') {
        picture.push(this.state.picture[i]);
      }
    }
    if (picture.length === 0) {
      Toast.show({ text: Strings.ST44, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.title === '') {
      Toast.show({ text: Strings.ST45, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.description === '') {
      Toast.show({ text: Strings.ST46, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.price === '') {
      Toast.show({ text: Strings.ST47, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.category === 0) {
      Toast.show({ text: Strings.ST48, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.gender === 0 && this.state.category === 1) {
      Toast.show({ text: Strings.ST50, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.size === 0 && this.state.category === 1) {
      Toast.show({ text: Strings.ST51, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }
    if (this.state.color === 0 && this.state.category !== 4) {
      Toast.show({ text: Strings.ST52, position: 'bottom', duration: Global.ToastDuration });
      this.setState({ posting: false });
      return;
    }

    let postObj = {
      picture: picture,
      title: this.state.title,
      description: this.state.description,
      price: this.state.price,
      category: this.state.category,
      brand: this.state.brand,
      gender: this.state.gender,
      size: this.state.size,
      color: this.state.color,
    }

    const { params } = this.props.navigation.state;
    if (params) { // edit post
      Fire.shared.postToStore(postObj, params.feedItem.postid, this.state.picturechanged).then(() => {
        Toast.show({ text: Strings.ST53, position: 'bottom', duration: Global.ToastDuration })
        this.initState();
        const navigateAction = NavigationActions.navigate({
          routeName: 'MyProfileScreen',
          params: {
            from: 'SellScreen'
          }
        });
        this.props.navigation.dispatch(navigateAction);
      })
    } else { // new post
      Fire.shared.postToStore(postObj).then(() => {
        Toast.show({ text: Strings.ST53, position: 'bottom', duration: Global.ToastDuration })
        this.initState();
        const navigateAction = NavigationActions.navigate({
          routeName: 'MyProfileScreen',
          params: {
            from: 'SellScreen'
          }
        });
        this.props.navigation.dispatch(navigateAction);
      })
    }
  }

  pressCategoryItem(index) { // 0~6, 0:category, 1:clothes ...
    if (index === 0) {
      this.setState({
        showCategoryItems: !this.state.showCategoryItems,
        showCategorySelectedItem: this.state.category === 0 ? false : true,
      })
    } else {
      this.setState({
        showCategoryItems: false,
        showCategorySelectedItem: true,
        category: index,
        showGenderAndSize: (index === 1) ? true : false,
        showColorItem: (index === 4) ? false : true,
      })
    }
  }
  renderCategoryItems() {
    let items = [];
    for (let i = 0; i < categories.length; i++) {
      const item = categories[i];
      items.push(
        <TouchableOpacity key={i} style={styles.subitems} onPress={this.pressCategoryItem.bind(this, i + 1)}>
          <Text style={styles.text_regular16}>{item}</Text>
        </TouchableOpacity>
      )
    }
    return (
      <View style={styles.categoryitems_wrapper}>
        {items}
      </View>
    )
  }
  pressGenderItem(index) { // 0~3, 0:gender, 1:male ...
    if (index === 0) {
      this.setState({
        showGenderItems: !this.state.showGenderItems,
        showGenderSelectedItem: false,
      })
    } else {
      this.setState({
        showGenderItems: false,
        showGenderSelectedItem: true,
        gender: index
      })
    }
  }
  renderGenderItems() {
    let items = [];
    for (let i = 0; i < genders.length; i++) {
      const item = genders[i];
      items.push(
        <TouchableOpacity key={`gender${i}`} style={styles.subitems} onPress={this.pressGenderItem.bind(this, i + 1)}>
          <Text style={styles.text_regular16}>{item}</Text>
        </TouchableOpacity>
      )
    }
    return (
      <View style={styles.genderitems_wrapper}>
        {items}
      </View>
    )
  }
  pressSizeItem(index) { // 0:no select, 1~
    if (index === 0) {
      this.setState({
        showSizeItems: !this.state.showSizeItems,
        showSizeSelectedItem: false,
      })
    } else {
      this.setState({
        showSizeItems: false,
        showSizeSelectedItem: true,
        size: index
      })
    }
  }
  renderSizeItems() { // 0 - 18, 23 - 38
    const sizeSetLength = Global.sizeSet.length;
    const oneColumnCount = Math.round(sizeSetLength / 5);
    const columnsCount = Math.ceil(sizeSetLength / oneColumnCount);
    let renderSizeItems = [];

    for (let i = 0; i < columnsCount; i++) {
      let renderOneColumn = [];
      for (let j = 0; j < oneColumnCount; j++) {
        if (oneColumnCount * i + j < sizeSetLength) {
          const sizeitem = Global.sizeSet[oneColumnCount * i + j];
          renderOneColumn.push(
            <TouchableOpacity key={`size${i}${j}`} style={styles.subitems} onPress={this.pressSizeItem.bind(this, oneColumnCount * i + j + 1)}>
              <Text style={styles.text_regular16}>{sizeitem}</Text>
            </TouchableOpacity>
          )
        }
      }
      renderSizeItems.push(
        <View key={i} style={styles.sizeitems_onecolumnwrapper}>
          {renderOneColumn}
        </View>
      )
    }
    return (
      <View style={styles.sizeitems_wrapper}>
        {renderSizeItems}
      </View>
    )
  }

  renderColorSet() {
    const countOneLine = 7;
    const oneViewWidth = Math.round(Global.screenWidth * 0.05);
    let colorViews = [];
    const newArrayCount = Math.ceil(colorSet.length / countOneLine);

    for (let i = 0; i < newArrayCount; i++) {
      let colorOneLineViews = [];
      for (let j = 0; j < countOneLine; j++) {
        if ((i * countOneLine + j) < colorSet.length) {
          colorOneLineViews.push(
            <TouchableOpacity onPress={() => this.setState({ color: i * countOneLine + j + 1, showColorSetBox: false })} key={`${i}_${j}`} style={styles.onecolor_wrapper}>
              <View style={{ width: oneViewWidth, height: oneViewWidth, backgroundColor: colorSet[i * countOneLine + j].color }}></View>
              <Text style={styles.text_bold12}>{colorSet[i * countOneLine + j].name}</Text>
            </TouchableOpacity>
          )
        }
      }
      colorViews.push(
        <View key={`line_${i}`} style={styles.colorset_onelinewrapper}>
          {colorOneLineViews}
        </View>
      )
    }
    return (
      <View style={styles.colorset_container}>
        {colorViews}
      </View>
    )
  }

  webViewNavigation(e) {
    if (this.state.connectingStripe) return;
    const serverURL = Global.stripeRedirectUri;
    if (e.url.indexOf(`${serverURL}`) != -1) {
      this.setState({
        connectingStripe: true,
        showStripeConnect: false,
      })

      // get code from redirect url
      const tempUrlArray = e.url.split('?');
      if (tempUrlArray.length !== 2) {
        Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration });
        return;
      }
      const tempParam = tempUrlArray[1];
      const tempParamArray = tempParam.split('&');
      let userid = '', code = '';
      for (let i = 0; i < tempParamArray.length; i++) {
        const element = tempParamArray[i];
        if (element.substring(0, 5) === 'state') {
          userid = element.split('=')[1];
        }
        if (element.substring(0, 4) === 'code') {
          code = element.split('=')[1];
        }
      }
      if (userid === '' || code === '') {
        Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration });
        return;
      }

      fetch(Global.stripeGetAccountIdUrl, {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code
        })
      }).then(res => {
        if (!res.ok) {
          Toast.show({ text: Strings.ST54, position: 'bottom', duration: Global.ToastDuration })
          this.setState({
            connectingStripe: false,
            posting: false
          })
          return;
        }
        res.json().then((resjson) => {
          const stripeAccountId = resjson.stripeAccountId || '';
          Fire.shared.setStripeAccountId(stripeAccountId);
          this.setState({
            connectingStripe: false,
          })
          Toast.show({ text: Strings.ST55, position: 'bottom', duration: Global.ToastDuration });
          this.postProduct();
        })
      }).catch((error) => {
        this.setState({
          connectingStripe: false,
          posting: false
        })
        Toast.show({ text: Strings.ST54, position: 'bottom', duration: Global.ToastDuration });
      })
    }
  }


  render() {

    if (this.state.showStripeConnect) {
      const myuid = Fire.shared.uid;
      const state_append = '&state=' + myuid;
      const finalUrl = Global.stripeConnectWebViewUrl + state_append;
      return (
        <View style={styles.stripe_webview}>
          <WebView
            style={{ flex: 1 }}
            source={{ uri: finalUrl }}
            onMessage={event => Global.isDev && console.log("this is the message")}
            startInLoadingState={true}
            onNavigationStateChange={this.webViewNavigation.bind(this)}
          />
        </View>
      )
    }

    let picture = [5];
    let pictureWidthPercentage = [5];
    for (let i = 0; i < 5; i++) {
      if (this.state.picture[i] === '') {
        picture[i] = require('@images/camera.png');
        pictureWidthPercentage[i] = '30%';
      } else {
        picture[i] = { uri: this.state.picture[i] };
        pictureWidthPercentage[i] = '100%';
      }
    }
    const displayPrice = this.state.price === '' ? '' : '$ ' + this.state.price;

    const brandPlaceholder = (this.state.category === 4) ? 'class code' : 'brand';

    return (

      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={styles.contentcontainer} scrollEnabled={false}>

          {/* arrow icon */}
          {this.state.showBackArrow &&
            <TouchableOpacity onPress={this.pressArrow.bind(this)} style={styles.arrowbtn_wrapper}>
              <Image
                source={require('@images/leftarrow.png')}
                style={{ width: Global.HeaderArrowWidth }}
                resizeMode='contain' />
            </TouchableOpacity>
          }
          {/* header */}
          <View style={styles.headertitle_wrapper}>
            <Text style={Global.Header}>sell</Text>
          </View>

          <ScrollView ref={(control) => this.scrollview = control} style={styles.product_area} contentContainerStyle={{ alignItems: 'center' }}>

            <View style={styles.product_subarea}>

              {/* pictures */}
              <View style={styles.picture_area}>
                <View style={styles.bigimage_wrapper}>
                  <TouchableOpacity onPress={this.pressPicture.bind(this, 0)} style={{ width: pictureWidthPercentage[0], height: pictureWidthPercentage[0] }}>

                    <Image source={picture[0]} style={styles.smallimage} resizeMode='contain' />
                  </TouchableOpacity>
                </View>

                <View style={styles.smallimage_onecolumn}>
                  <View style={styles.smallimage_wrapper}>
                    <TouchableOpacity onPress={this.pressPicture.bind(this, 1)} style={{ width: pictureWidthPercentage[1], height: pictureWidthPercentage[1] }}>

                      <Image source={picture[1]} style={styles.smallimage} resizeMode='contain' />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.smallimage_wrapper}>
                    <TouchableOpacity onPress={this.pressPicture.bind(this, 2)} style={{ width: pictureWidthPercentage[2], height: pictureWidthPercentage[2] }}>

                      <Image source={picture[2]} style={styles.smallimage} resizeMode='contain' />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.smallimage_onecolumn}>
                  <View style={styles.smallimage_wrapper}>
                    <TouchableOpacity onPress={this.pressPicture.bind(this, 3)} style={{ width: pictureWidthPercentage[3], height: pictureWidthPercentage[3] }}>

                      <Image source={picture[3]} style={styles.smallimage} resizeMode='contain' />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.smallimage_wrapper}>
                    <TouchableOpacity onPress={this.pressPicture.bind(this, 4)} style={{ width: pictureWidthPercentage[4], height: pictureWidthPercentage[4] }}>

                      <Image source={picture[4]} style={styles.smallimage} resizeMode='contain' />
                    </TouchableOpacity>
                  </View>
                </View>

              </View>

              {/* title and description */}
              <View style={styles.title_wrapper}>
                <TextInput maxLength={Global.TM30} autoCapitalize='words' multiline={false} placeholder='title' placeholderTextColor='black' style={styles.title_input} onChangeText={(text) => this.setState({ title: text })} value={this.state.title}></TextInput>
              </View>

              <Text style={[styles.text_black16, { marginTop: 30 }]}>description</Text>
              <Text style={styles.text_regular14}>ex. condition of the item, style, model, flaws</Text>


              <View style={styles.description_wrapper}>
                <TextInput maxLength={Global.TM200} autoCapitalize='none' numberOfLines={2} multiline={true} textAlignVertical='bottom' placeholder='' style={styles.description_input} onChangeText={(text) => this.setState({ description: text })} value={this.state.description} ></TextInput>
              </View>

              {/* price and category */}
              <View style={styles.pricecategory_container}>

                <View style={styles.price_container}>
                  {/* price */}
                  <TextInput style={styles.price_input} multiline={false} maxLength={Global.TM10} keyboardType={'number-pad'} placeholder='price' placeholderTextColor='black' onChangeText={text => this.changePrice(text)} value={displayPrice}></TextInput>

                  {/* earnings */}
                  <Text style={[styles.text_regular14, { marginTop: 10 }]}>earnings - ${this.state.earnings}</Text>
                </View>

                {/* category */}
                <View style={styles.category_container}>
                  <TouchableOpacity style={styles.productitem_title} onPress={this.pressCategoryItem.bind(this, 0)}>
                    <Text style={styles.text_black16}>category </Text>
                    <Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
                    {/* <View style={{ top: -4 }}>
                      <FontAwesome name="sort-down" size={16} color={'black'} />
                    </View> */}
                  </TouchableOpacity>

                  {this.state.showCategorySelectedItem &&
                    <Text style={styles.text_selecteditem}>{categories[this.state.category - 1]}</Text>
                  }

                  {this.state.showCategoryItems &&
                    this.renderCategoryItems()
                  }
                </View>

              </View>



              {/* brand */}
              <View style={styles.brand_wrapper}>
                <TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} placeholder={brandPlaceholder} placeholderTextColor='black' style={styles.brand_input} onChangeText={(text) => this.setState({ brand: text })} value={this.state.brand} ></TextInput>
              </View>

              {!this.state.showColorItem &&
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.text_regular14}>ie. econ203</Text>
                </View>
              }


              {/* gender and size */}
              {this.state.showGenderAndSize &&
                <View style={styles.gendersize_container}>
                  {/* gender */}
                  <View style={styles.gender_container}>

                    <TouchableOpacity style={styles.productitem_title} onPress={this.pressGenderItem.bind(this, 0)}>
                      <Text style={styles.text_black16}>gender </Text>
                      <Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
                    </TouchableOpacity>

                    {this.state.showGenderSelectedItem &&
                      <Text style={styles.text_selecteditem}>{genders[this.state.gender - 1]}</Text>
                    }
                    {this.state.showGenderItems &&
                      this.renderGenderItems()
                    }
                  </View>

                  {/* size */}
                  <View style={styles.size_container}>

                    <TouchableOpacity style={styles.productitem_title} onPress={this.pressSizeItem.bind(this, 0)}>
                      <Text style={styles.text_black16}>size </Text>
                      <Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
                    </TouchableOpacity>
                    {this.state.showSizeSelectedItem &&
                      <Text style={styles.text_selecteditem}>{Global.sizeSet[this.state.size - 1]}</Text>
                    }
                    {this.state.showSizeItems &&
                      this.renderSizeItems()
                    }

                  </View>

                </View>
              }

              {/* color */}
              {this.state.showColorItem &&
                <View style={styles.color_container}>
                  <TouchableOpacity style={styles.productitem_title} onPress={() => this.setState({ showColorSetBox: !this.state.showColorSetBox })}>
                    <Text style={styles.text_black16}>color </Text>
                    <Ionicons name="md-arrow-dropdown" size={25} color={'black'} />
                  </TouchableOpacity>

                  <View style={[styles.color_showbox, { backgroundColor: this.state.color === 0 ? Global.colorLoginBack : colorSet[this.state.color - 1].color }]}></View>
                </View>
              }


              {this.state.showColorSetBox && this.state.showColorItem && this.renderColorSet()}

              {/* post button */}
              <View style={styles.postbtn_container}>

                <TouchableOpacity style={styles.postbtn_wrapper} onPress={this.pressPost.bind(this)}>
                  {!this.state.posting &&
                    <Text style={styles.posttext}>post</Text>
                  }
                  {this.state.posting &&
                    <ActivityIndicator style={{ height: '80%' }} size="large" color="#f39c12" />
                  }
                </TouchableOpacity>

              </View>

            </View>
          </ScrollView>

          <View style={{ height: Global.TabBarHeight }}></View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(Sell);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Global.colorLoginBack
  },
  postbtn_container: {
    marginTop: 80,
    width: "100%",
    height: Math.round(Global.screenWidth * 0.14),
    alignItems: "center",
    marginBottom: 30
  },
  posttext: {
    fontFamily: Global.Nimbus_Bold,
    color: "white",
    fontSize: 20
  },
  postbtn_wrapper: {
    width: "85%",
    height: "100%",
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  text_black16: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16
  },
  text_regular14: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 14
  },
  text_regular16: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 16
  },
  text_selecteditem: {
    marginTop: 7,
    marginLeft: "20%",
    fontFamily: Global.Nimbus_Bold,
    fontSize: 16
  },
  brand_wrapper: {
    marginTop: 30,
    width: "100%",
    height: Global.screenWidth * 0.1,
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "flex-end"
  },
  brand_input: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16,
    fontWeight: "normal",
    width: "100%"
  },
  gendersize_container: {
    marginTop: 40,
    flexDirection: "row"
  },
  gender_container: {
    flex: 0.55,
    flexDirection: "column",
    alignItems: "flex-start"
  },
  size_container: {
    flex: 0.45,
    flexDirection: "column",
    alignItems: "flex-start"
  },
  color_container: {
    marginTop: 40,
    flexDirection: "row"
  },
  pricecategory_container: {
    marginTop: 40,
    width: "100%",
    flexDirection: "row"
  },
  price_container: {
    flex: 0.55,
    flexDirection: "column"
  },
  category_container: {
    flex: 0.45,
    flexDirection: "column",
    top: 3,
    alignItems: "flex-start"
  },
  price_input: {
    width: "50%",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    fontFamily: Global.Nimbus_Black,
    fontSize: 16,
    fontWeight: "normal"
  },
  title_wrapper: {
    marginTop: 40,
    width: "100%",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "flex-end"
  },
  title_input: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16,
    fontWeight: "normal",
    width: "100%"
  },
  description_wrapper: {
    width: "100%",
    height: Global.screenWidth * 0.16,
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  description_input: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 15,
    fontWeight: "normal",
    width: "100%"
  },
  smallimage_wrapper: {
    width: Global.screenWidth * 0.19,
    height: Global.screenWidth * 0.19,
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  smallimage: {
    width: "100%",
    height: "100%"
  },
  picture_area: {
    width: "100%",
    height: Math.round(Global.screenWidth * 0.4),
    flexDirection: "row",
    justifyContent: "space-between"
  },
  product_area: {
    flex: 1,
    width: "100%",
    flexDirection: "column"
  },
  arrowbtn_wrapper: {
    width: "100%",
    marginTop: 10,
    marginLeft: 15,
    justifyContent: "flex-start"
  },
  headertitle_wrapper: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  contentcontainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column"
  },
  bigimage_wrapper: {
    width: Math.round(Global.screenWidth * 0.4),
    height: Math.round(Global.screenWidth * 0.4),
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  color_showbox: {
    marginLeft: 30,
    width: 20,
    height: 20,
    borderColor: "black",
    borderWidth: 1
  },
  colorset_container: {
    marginTop: 15,
    width: "95%",
    alignSelf: "center",
    flexDirection: "column"
  },
  colorset_onelinewrapper: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text_bold12: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 12
  },
  categoryitems_wrapper: {
    marginLeft: "20%",
    flexDirection: "column"
  },
  subitems: {
    marginTop: 7
  },
  genderitems_wrapper: {
    marginLeft: "20%",
    flexDirection: "column"
  },
  sizeitems_wrapper: {
    flexDirection: "row",
    left: -Math.round(Global.screenWidth * 0.07)
  },
  sizeitems_onecolumnwrapper: {
    marginLeft: Math.round(Global.screenWidth * 0.04),
    flexDirection: "column",
    alignItems: "flex-end"
  },
  product_subarea: {
    width: "85%",
    flexDirection: "column"
  },
  smallimage_onecolumn: {
    flexDirection: "column",
    justifyContent: "space-between"
  },
  productitem_title: {
    flexDirection: "row",
    alignItems: "center"
  },
  onecolor_wrapper: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  stripe_webview: {
    flex: 1,
    backgroundColor: '#E8EBEF',
    paddingBottom: Global.TabBarHeight
  }
});