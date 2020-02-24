import React from "react";
import { Root } from "native-base";
import { StatusBar, View } from "react-native";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";
import GuestNavigation from "./application/navigations/Guest";
import LoggedNavigation from "./application/navigations/Logged";
import AppPreLoader from "@components/AppPreLoader";
import OfflineBar from "@components/OfflineBar";
import Fire from "@utils/Firebase";

console.disableYellowBox = true;

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLogged: false,
      loaded: false,
      isReady: false
    };
  }

  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      // main bottomtab image
      require("./assets/images/home.png"),
      require("./assets/images/magnifying-glass.png"),
      require("./assets/images/camera.png"),
      require("./assets/images/mail.png"),
      require("./assets/images/user.png"),

      // back image
      require("./assets/images/logo.png"),
      require("./assets/images/back_landing.png"),
      require("./assets/images/back_login.png"),
      require("./assets/images/back_signup.png"),
      require("./assets/images/back_confirmemail.png"),
      require("./assets/images/back_boughtandsold.png"),
      require("./assets/images/back_myaccount.png"),
      require("./assets/images/back_pickupdropoffconfirm.png"),
      require("./assets/images/back_pickupdropoffsuccess.png"),
      require("./assets/images/back_reportuser.png"),
      require("./assets/images/back_emptyInbox.png"),

      require("./assets/images/shopping-bag.png"),
      require("./assets/images/comment.png"),
      require("./assets/images/comment_click.png"),
      require("./assets/images/share.png"),
      require("./assets/images/share_click.png"),
      require("./assets/images/like.png"),
      require("./assets/images/like_click.png"),
      require("./assets/images/triangle_white.png"),
      require("./assets/images/flag.png"),
      require("./assets/images/ring.png"),
      require("./assets/images/coin-icon.png"),
      require("./assets/images/settings.png"),
      require("./assets/images/line_profilereview.png"),
      require("./assets/images/chatMeArrow.png"),
      require("./assets/images/chatOtherArrow.png"),
      require("./assets/images/leftarrow.png"),
      require("./assets/images/nointernet.png"),
      require("./assets/images/avatar.png")
      // require('./assets/images/star.png'),
    ]);

    await Promise.all([...imageAssets]);
  }

  async componentDidMount() {
    await Font.loadAsync({
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      eurostile_extended_black: require("./assets/fonts/eurostile_extended_black.ttf"),
      "Nimbus-Sans-D-OT-Black-Extended": require("./assets/fonts/Nimbus-Sans-D-OT-Black-Extended.ttf"),
      "Nimbus-Sans-D-OT-Bold-Extended": require("./assets/fonts/Nimbus-Sans-D-OT-Bold-Extended.ttf"),
      "Nimbus-Sans-D-OT-Regular-Extended": require("./assets/fonts/Nimbus-Sans-D-OT-Regular-Extended.ttf")
    });

    await this._loadAssetsAsync();
    this.setState({ isReady: true })

    await firebase.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.setState({
          isLogged: user.emailVerified,
          loaded: true
        });
        this.setLocationAsync();
      } else {
        this.setState({
          isLogged: false,
          loaded: true
        });
      }
    });
  }

  setLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      // Global.isDev && console.log("Permission to access location was denied");
    } else {
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const long = location.coords.longitude;
      Fire.shared.setMyLocation(lat, long);
    }
  };

  render() {
    if (!this.state.isReady) {
      return (
        <View></View>
        // <AppLoading
        //   startAsync={this._loadAssetsAsync}
        //   onFinish={() => this.setState({ isReady: true })}
        //   onError={console.warn}
        // />
      );
    }
    const { isLogged, loaded, isReady } = this.state;

    if (!loaded) {
      return <AppPreLoader />;
    }

    if (isLogged && isReady) {
      return (
        <Root>
          {/* <OfflineBar /> */}
          <StatusBar hidden />
          <LoggedNavigation />
        </Root>
      );
    } else {
      return (
        <Root>
          <StatusBar hidden />
          <GuestNavigation />
        </Root>
      );
    }
  }
}
