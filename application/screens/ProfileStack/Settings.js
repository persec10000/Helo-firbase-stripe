import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';

const rightarrowsize = 20;

export default class Settings extends Component {

  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isAdmin: false,
    }
  }

  componentDidMount() {
    Fire.shared.checkAdmin().then((result) => {
      if (result) {
        this.setState({
          isAdmin: true,
        })
      }
    })
  }

  pressAccountSetting() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'AccountSettingScreen',
    });
    this.props.navigation.dispatch(navigateAction);
  }

  pressVacationMode() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'VacationModeScreen',
      params: {
        vacation: this.props.navigation.state.params.vacation ? this.props.navigation.state.params.vacation : false,
      }
    });
    this.props.navigation.dispatch(navigateAction);
  }


  render() {

    return (

      <View style={styles.container}>

        <AppHeaderArrow title={'settings'} pressArrow={() => this.props.navigation.goBack()} />

        <View style={styles.main_container}>

          {/* items */}
          <Text style={styles.item_title}>my account</Text>

          <View style={styles.item_subtitle_wrapper}>
            <Text style={styles.item_subtitle}>account settings</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('AccountSettingScreen')} style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>


          <Text style={styles.item_title}>my profile</Text>

          <View style={styles.item_subtitle_wrapper2}>
            <Text style={styles.item_subtitle}>edit profile</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ProfileSettingScreen')}
              style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>

          <View style={styles.item_subtitle_wrapper}>
            <Text style={styles.item_subtitle}>vacation mode</Text>
            <TouchableOpacity
              onPress={() => this.pressVacationMode()}
              style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>


          <Text style={styles.item_title}>helo guidelines</Text>

          <View style={styles.item_subtitle_wrapper}>
            <Text style={styles.item_subtitle}>the rules</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('RulesScreen')}
              style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>


          <Text style={styles.item_title}>help</Text>

          <View style={styles.item_subtitle_wrapper2}>
            <Text style={styles.item_subtitle}>faq's</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('FaqsScreen')}
              style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>


          <View style={styles.item_subtitle_wrapper2}>
            <Text style={styles.item_subtitle}>contact us</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ContactUsScreen')}
              style={styles.rightarrow_btn} >
              <FontAwesome name={'long-arrow-right'} size={rightarrowsize} color={'black'} />
            </TouchableOpacity>
          </View>

          {/* sign out */}
          <View style={styles.signout_wrapper} >
            <TouchableOpacity onPress={() => this.props.navigation.navigate('LogoutScreen')}>
              <Text style={styles.signout_text}>sign out</Text>
            </TouchableOpacity>
          </View>

          {/* admin page */}
          {this.state.isAdmin &&
            <View style={styles.management_wrapper} >
              <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminPage')}>
                <Text style={styles.signout_text}>admin page</Text>
              </TouchableOpacity>
            </View>
          }

        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  item_subtitle: {
    fontFamily: Global.Nimbus_Regular,
    fontSize: 15
  },
  item_title: {
    fontFamily: Global.Nimbus_Black,
    fontSize: 17,
    marginTop: 10
  },
  container: {
    flex: 1,
    backgroundColor: Global.colorLoginBack,
    alignItems: "center"
  },
  main_container: {
    flex: 1,
    width: "85%",
    height: "100%",
    flexDirection: "column",
    paddingTop: 20
  },
  item_subtitle_wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 10
  },
  item_subtitle_wrapper2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5
  },
  signout_wrapper: {
    marginTop: 20,
    alignItems: 'flex-start'
  },
  signout_text: {
    color: Global.colorButtonBlue,
    fontFamily: Global.Nimbus_Black,
    fontSize: 13
  },
  rightarrow_btn: {
    justifyContent: "center",
    alignItems: "center"
  },
  management_wrapper: {
    marginTop: 30,
    alignItems: 'flex-start',
  },
});