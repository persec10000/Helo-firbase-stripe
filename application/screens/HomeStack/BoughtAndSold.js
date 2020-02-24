
import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Global from '@utils/GlobalValue';

const imageHeight = Math.round(Global.screenWidth * 0.54)

export default class BoughtAndSold extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props)
        const { params } = props.navigation.state;
        this.state = {
            bought: params.bought || false,
            otheruid: params.uid,
            otherusername: params.username,
            transactionid: params.transactionid,
        };
    }
    pressViewChat() {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OrderChatScreen',
            params: {
                transactionid: this.state.transactionid,
                otheruid: this.state.otheruid
            }
        });
        this.props.navigation.pop();
        this.props.navigation.dispatch(navigateAction);
    }
    
    render() {
        return (

            <View style={styles.container}>

                <View style={styles.title_wrapper}>
                    <Text style={styles.text_black20}>congratulations on</Text>
                    <Text style={styles.text_black20}>{this.state.bought ? 'your purchase from' : 'your sale to'}</Text>
                    <Text style={styles.text_black18}>@{this.state.otherusername}!</Text>
                </View>

                <View style={styles.bkimage_wrapper}>
                    <Image
                        source={require('@images/back_boughtandsold.png')}
                        style={styles.bkimage}
                        resizeMode='contain' />
                </View>

                <View style={styles.message_wrapper}>
                    <Text style={styles.text_black15}>{this.state.bought ? `we've messaged your` : 'the buyer has'}</Text>
                    <Text style={styles.text_black15}>{this.state.bought ? 'proposed pickup to' : 'messaged you'}</Text>
                    <Text style={styles.text_black15}>{this.state.bought ? 'the seller' : 'a pickup'}</Text>
                </View>

                <View style={styles.viewchat_wrapper}>
                    <TouchableOpacity onPress={this.pressViewChat.bind(this)} style={styles.viewchat_btn}>
                        <Text style={styles.viewchat_text}>view chat</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: Global.colorYellow
    },
    text_black20: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 20
    },
    text_black18: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 18
    },
    text_black15: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15
    },
    title_wrapper: {
        flex: 0.25,
        justifyContent: "center",
        alignItems: "center"
    },
    bkimage_wrapper: {
        flex: 0.35,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    bkimage: {
        width: "90%",
        height: imageHeight
    },
    message_wrapper: {
        flex: 0.17,
        justifyContent: "center",
        alignItems: "center"
    },
    viewchat_wrapper: {
        flex: 0.23,
        justifyContent: "flex-start",
        alignItems: "center"
    },
    viewchat_btn: {
        width: "80%",
        height: "35%",
        backgroundColor: Global.colorButtonBlue,
        justifyContent: "center",
        alignItems: "center"
    },
    viewchat_text: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 22,
        color: "white"
    }
});