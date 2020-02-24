
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';


const imageHeight = Math.round(Global.screenWidth * 0.6)
const confirmbtn_height = 65;

export default class PickupAndDropoffConfirm extends Component { //'PickupAndDropoffConfirm'
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    const { params } = props.navigation.state;
    this.state = {
      me: params.me,
      otheruid: params.otheruid,
      otherusername: params.otherusername,
      transactionid: params.transactionid,
      postids: params.postids,
      price: params.price,
      wasAutoReleased: true,
      firstbuy: params.firstbuy,
    };
  }

  componentDidMount() {
    Fire.shared.checkAutoReleased(this.state.transactionid).then((result) => {
      this.setState({ wasAutoReleased: result });
    }).catch((error) => Global.isDev && console.log(error));
  }

  pressConirm(isConfirm) {
    if (isConfirm) {
      const navigateAction = NavigationActions.navigate({
        routeName: 'PickupAndDropoffSuccess',
        params: {
          from: 'PickupAndDropoffConfirm',
          me: this.state.me,
          otheruid: this.state.otheruid,
          otherusername: this.state.otherusername,
          transactionid: this.state.transactionid,
          postids: this.state.postids,
          price: this.state.price,
          wasAutoReleased: this.state.wasAutoReleased,
          firstbuy: this.state.firstbuy,
        }
      });
      this.props.navigation.dispatch(navigateAction);
    } else {
      if (this.state.wasAutoReleased) {
        Toast.show({ text: Strings.ST33, position: 'bottom', duration: Global.ToastDuration });
        return;
      }
      const navigateAction = NavigationActions.navigate({
        routeName: 'PickupAndDropoffIssue',
        params: {
          from: 'PickupAndDropoffConfirm',
          me: this.state.me,
          otheruid: this.state.otheruid,
          otherusername: this.state.otherusername,
          transactionid: this.state.transactionid,
          postids: this.state.postids,
          price: this.state.price,
          firstbuy: this.state.firstbuy,
        }
      });
      this.props.navigation.dispatch(navigateAction);
    }
  }

  render() {

    return (

      <SafeAreaView style={styles.container}>

        {/* hearder */}
        <View style={styles.header_container}>
          <Text style={styles.text_black22}>you {this.state.me ? 'picked up' : 'dropped off'}</Text>
          <Text style={styles.text_bold22}>{this.state.me ? 'from' : 'to'} @{this.state.otherusername}!</Text>
        </View>

        <View style={styles.content_container}>

          <View style={styles.f_13}></View>

          <View style={styles.bkimage_wrapper}>
            <Image
              source={require('@images/back_pickupdropoffconfirm.png')}
              style={styles.bkimage}
              resizeMode='contain' />
          </View>

          {/* confirm button */}
          <View style={styles.confirmbtn_wrapper}>
            <TouchableOpacity onPress={this.pressConirm.bind(this, true)} style={styles.confirmbtn}>
              <Text style={[styles.text_bold22white, { lineHeight: confirmbtn_height }]}>confirm {this.state.me ? 'pickup' : 'dropoff'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.didntbtn_wrapper}>
            <TouchableOpacity onPress={this.pressConirm.bind(this, false)} >
              <Text style={styles.didnttext}>{this.state.me ? 'pickup' : 'dropoff'} didn't happen?</Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>

    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Global.colorYellow,
    alignItems: "center"
  },
  header_container: {
    width: "100%",
    height: Math.round(Global.screenWidth * 0.25),
    justifyContent: "flex-end",
    alignItems: "center"
  },
  text_black22: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 22,
    color: "black"
  },
  text_bold22: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 22,
    color: "black"
  },
  text_bold22white: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 22,
    color: "white"
  },
  content_container: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    marginBottom: Global.TabBarHeight
  },
  bkimage_wrapper: {
    flex: 0.47,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  bkimage: {
    width: "90%",
    height: imageHeight
  },
  confirmbtn_wrapper: {
    flex: 0.22,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  didntbtn_wrapper: {
    flex: 0.18,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  confirmbtn: {
    width: "80%",
    height: confirmbtn_height,
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  didnttext: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 14,
    marginTop: 20
  },
  f_13: {
    flex: 0.13
  }
});