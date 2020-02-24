
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Image, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Toast } from 'native-base';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';
import { sendEmailToAdminForReportUser } from '@utils/GlobalFunction'
import Strings from '@utils/Strings';

const imageHeight = Math.round(Global.screenWidth * 0.58)

export default class ReportUser extends Component { // ReportUserScreen
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    const { params } = props.navigation.state;
    this.state = {
      to_uid: params.to_uid,
      to_name: params.to_name,
      text: '',
      isEmptyText: false,
      status: 1, // 1:init 2:submitting 3:submitted
    };
  }
  pressUser() {
    const uid = this.state.to_uid;
    const navigateAction = NavigationActions.navigate({
      routeName: 'OtherProfileScreen',
      params: {
        from: 'ReportUserScreen',
        uid: uid,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressLeftArrow() {
    const { params } = this.props.navigation.state;
    if (params && params.from) {
      if (params.from === 'OtherProfileScreen') {
        this.props.navigation.goBack()
        return;
      } else {
        const navigateAction = NavigationActions.navigate({
          routeName: params.from,
        });
        this.props.navigation.dispatch(navigateAction);
        return;
      }
    } else {
      this.props.navigation.goBack()
    }
  }

  pressSubmit() {
    const text = this.state.text;
    if (text === '') {
      this.setState({ isEmptyText: true });
      setTimeout(() => {
        this.setState({ isEmptyText: false })
      }, 2000);
      return;
    }
    this.setState({
      status: 2,
    })
    const { params } = this.props.navigation.state;
    Fire.shared.getUserName().then(myname => {
      Fire.shared.getEmailByUserName(this.state.to_name).then(email => {
        const currentTimeStamp = new Date().getTime();
        const myemail = Fire.shared.email;
        const reportObj = {
          from_email: myemail,
          to_email: email,
          time: currentTimeStamp,
          from_uid: params.from_uid,
          to_uid: params.to_uid,
          transactionid: params.transactionid
        }

        Fire.shared.reportUser(reportObj, text).then(() => {
          this.setState({ status: 3 });
          Toast.show({ text: Strings.ST59, position: 'bottom', duration: Global.ToastDuration })
        }).catch((error) => {
          Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
        })
        // send email to admin
        const mailObj = {
          from_name: myname,
          from_email: myemail,
          to_name: this.state.to_name,
          to_email: email,
          message: text,
        }
        sendEmailToAdminForReportUser(mailObj);
      })
    }).catch((error) => Global.isDev && console.log(error));

  }

  render() {

    return (

      <View style={styles.container}>

        <KeyboardAwareScrollView scrollEnabled={false} contentContainerStyle={styles.contentcontainer} >

          {/* hearder */}
          <AppHeaderArrow title={`reportuser`} pressArrow={this.pressLeftArrow.bind(this)} />

          <View style={styles.headertext_wrapper}>

            <Text style={styles.text_black20}>report  </Text>
            <TouchableOpacity onPress={this.pressUser.bind(this)}>
              <Text style={styles.text_black20}>@{this.state.to_name}!</Text>
            </TouchableOpacity>

          </View>


          <View style={styles.main_container}>

            <View style={styles.f_12}></View>

            <View style={styles.bkimage_wrapper}>
              <Image
                source={require('@images/back_reportuser.png')}
                style={styles.bkimage}
                resizeMode='contain' />
            </View>

            <View style={styles.quote_wrapper}>
              <Text style={styles.quotetext}>tell us what happened</Text>
            </View>

            <View style={[styles.report_wrapper, { borderBottomColor: this.state.isEmptyText ? 'red' : "black" }]}>
              <TextInput onChangeText={(text) => this.setState({ text: text })} multiline={true} textAlignVertical='bottom' maxLength={Global.TM200} style={styles.report_input} placeholder=""></TextInput>
            </View>

            <View style={styles.submitbtn_wrapper}>

              <TouchableOpacity disabled={this.state.status > 1 ? true : false} onPress={this.pressSubmit.bind(this)} style={{ paddingBottom: 25 }}>
                {this.state.status === 2 ?
                  <ActivityIndicator size="large" color="#f39c12" />
                  :
                  <Text style={styles.text_black16}>submit</Text>
                }
              </TouchableOpacity>

            </View>

          </View>

        </KeyboardAwareScrollView>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Global.colorGreen
  },
  contentcontainer: {
    flex: 1,
    width: "100%",
    height: "100%"
  },
  header_wrapper: {
    flexDirection: "column",
    width: "100%",
    height: Math.round(Global.screenWidth * 0.2)
  },
  arrow_wrapper: {
    flex: 0.3,
    justifyContent: "flex-end",
    alignItems: "flex-start"
  },
  headertext_wrapper: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "center",
    top: -20,
    // alignItems: "flex-end",
  },
  text_black20: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 20,
    color: "black"
  },
  text_bold20: {
    fontFamily: Global.Nimbus_Bold,
    fontSize: 20,
    color: "black"
  },
  main_container: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    marginBottom: Global.TabBarHeight
  },
  bkimage_wrapper: {
    flex: 0.43,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  bkimage: {
    width: "90%",
    height: imageHeight
  },
  quote_wrapper: {
    flex: 0.18,
    width: "85%",
    alignSelf: "center",
    justifyContent: "flex-end"
  },
  quotetext: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 14,
    marginTop: 20
  },
  report_wrapper: {
    flex: 0.12,
    width: "85%",
    alignSelf: "center",
    // borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "flex-end"
  },
  report_input: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 15,
    fontWeight: "normal"
  },
  submitbtn_wrapper: {
    flex: 0.15,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  text_black16: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 16
  },
  f_12: {
    flex: 0.12
  }
});