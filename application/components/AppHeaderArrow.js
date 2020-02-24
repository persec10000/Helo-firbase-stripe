import React, { Component } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Global from "@utils/GlobalValue";

const title_paddingtop = 20;

export default class AppHeaderArrow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isReportScreen: false,
            isAdminReportUserScreen: false,
            isSettingsScreen: false
        };
    }
    componentDidMount() {
        const title = this.props.title;
        if (title === "reportuser") {
            // ReportUserScreen
            this.setState({ isReportScreen: true });
        } else if (title.indexOf("report user list") != -1) {
            // AdminReportUser
            this.setState({ isAdminReportUserScreen: true });
        } else if (title === "settings") {
            this.setState({ isSettingsScreen: true });
        }
    }
    render() {
        return (
            <View style={styles.header_container}>
                <View style={styles.arrow_wrapper}>
                    <TouchableOpacity onPress={() => this.props.pressArrow()}>
                        <Image
                            source={require("@images/leftarrow.png")}
                            style={{ width: Global.HeaderArrowWidth }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.title_wrapper}>
                    <Text
                        style={
                            this.state.isSettingsScreen
                                ? Global.Header
                                : this.state.isAdminReportUserScreen
                                    ? Global.HeaderSmall
                                    : Global.HeaderMedium
                        }
                    >
                        {this.state.isReportScreen ? "" : this.props.title}
                    </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header_container: {
        flexDirection: "column",
        width: "100%",
        height: Math.round(Global.screenWidth / 4)
    },
    arrow_wrapper: {
        flex: 0.3,
        justifyContent: "flex-end",
        alignItems: "flex-start"
    },
    title_wrapper: {
        flex: 0.7,
        paddingTop: title_paddingtop,
        justifyContent: "flex-start",
        alignItems: "center"
    }
});
