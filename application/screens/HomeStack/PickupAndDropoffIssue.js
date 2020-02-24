
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Text, SafeAreaView, StyleSheet } from 'react-native';
import Global from '@utils/GlobalValue';

const buttonsheight = 50;

export default class PickupAndDropoffIssue extends Component { //'PickupAndDropoffIssue'
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
    };
  }

  pressBlueButton(isReschedulePickup) {
    if (isReschedulePickup) {
      const navigateAction = NavigationActions.navigate({
        routeName: 'OrderChatScreen',
        params: {
          transactionid: this.state.transactionid
        }
      });
      this.props.navigation.pop(); this.props.navigation.pop(); this.props.navigation.pop();
      this.props.navigation.dispatch(navigateAction);
    } else { // cancel order

      const navigateAction = NavigationActions.navigate({
        routeName: 'OrderCancelScreen',
        params: {
          me: this.state.me,
          otheruid: this.state.otheruid,
          otherusername: this.state.otherusername,
          transactionid: this.state.transactionid,
          postids: this.state.postids,
        }
      });
      this.props.navigation.dispatch(navigateAction);
    }
  }

  render() {

    return (

      <SafeAreaView style={styles.safearea_container}>

        {/* hearder */}
        <View style={styles.header_wrapper}>
          <Text style={Global.HeaderSmall}>{this.state.me ? 'pickup' : 'dropoff'} didn't happen</Text>
        </View>


        <View style={styles.main_container}>

          <View style={styles.subtitle_wrapper}>
            <Text style={styles.text_black15}>we're sorry about that :(</Text>
          </View>

          <View style={styles.optionstext_wrapper}>
            <Text style={styles.text_black18}>you have 2 options</Text>
          </View>

          <View style={styles.options_line}></View>

          {/* button */}
          <View style={styles.buttons_wrapper}>
            <TouchableOpacity onPress={this.pressBlueButton.bind(this, true)} style={styles.buttons}>
              <Text style={[styles.buttons_text, { lineHeight: buttonsheight }]}>reschedule pickup</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttons_wrapper}>
            <TouchableOpacity onPress={this.pressBlueButton.bind(this, false)} style={styles.buttons}>
              <Text style={[styles.buttons_text, { lineHeight: buttonsheight }]}>cancel order</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lasttext_wrapper}>
            <Text style={styles.lasttext}>if you cancel the order you will receive {this.state.me ? 'your money back + a penalty fee from the seller' : 'a penalty fee from the buyer'}</Text>
          </View>


        </View>

      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  safearea_container: {
    flex: 1,
    backgroundColor: Global.colorLoginBack,
    alignItems: "center"
  },
  header_wrapper: {
    width: "100%",
    height: Global.screenWidth * 0.2,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10
  },
  main_container: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    marginBottom: Global.TabBarHeight
  },
  subtitle_wrapper: {
    flex: 0.05,
    justifyContent: "center",
    alignItems: "center"
  },
  text_black15: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 15
  },
  text_black18: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 18
  },
  optionstext_wrapper: {
    flex: 0.11,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  buttons_text: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 18,
    color: "white"
  },
  options_line: {
    flex: 0.02,
    borderBottomColor: "black",
    borderBottomWidth: 1
  },
  buttons_wrapper: {
    flex: 0.14,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  buttons: {
    width: "80%",
    height: buttonsheight,
    backgroundColor: Global.colorButtonBlue,
    justifyContent: "center",
    alignItems: "center"
  },
  lasttext_wrapper: {
    flex: 0.54,
    paddingTop: 15,
    width: "75%",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  lasttext: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 13,
    textAlign: "center"
  }
});