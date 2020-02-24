import React, { PureComponent } from "react";
import { View, Dimensions, Image } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Text, Button } from "native-base";

const { width, height } = Dimensions.get("window");

function MiniOfflineSign() {
  return (
    <View
      style={{
        height: height,
        width: width,
        flexDirection: "column",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        zIndex: 9,
        backgroundColor: "#FFF"
      }}
    >
      <Image
        source={require("@images/nointernet.png")}
        style={{ width: 120, height: 120, marginBottom: 10 }}
      />
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
        No Internet Connection
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 30, color: "#b5b5b5" }}>
        Check your connection
      </Text>
      <View>
        <Button
          rounded
          block
          style={{
            minWidth: 200,
            backgroundColor: "white",
            marginBottom: 8,
            height: 53,
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
            shadowOffset: {
              width: 0,
              height: 0
            }
          }}
        >
          <Text>Try Again</Text>
        </Button>
      </View>
    </View>
  );
}

class OfflineBar extends PureComponent {
  state = {
    isConnected: true
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };

  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    }
    return null;
  }
}

export default OfflineBar;
