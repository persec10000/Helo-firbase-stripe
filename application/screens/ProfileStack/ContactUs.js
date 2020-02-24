
import React, { Component } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Global from '@utils/GlobalValue';
import * as MailComposer from 'expo-mail-composer';
import AppHeaderArrow from '@components/AppHeaderArrow';

export default class ContactUs extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            vacationStatus: false,
        };
    }

    sendMail() {
        MailComposer.composeAsync({
            recipients: ['info@theheloapp.com'],
            subject: 'any question',
            body: 'content'
        }).catch(() => {
            
        })
    }

    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'contact us'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.main_container}>

                    <View style={styles.subtext1_wrapper}>
                        <Text style={styles.text_black18}>Have questions or</Text>
                        <Text style={styles.text_black18}>comments? We'd love to</Text>
                        <Text style={styles.text_black18}>hear them!</Text>
                    </View>

                    {/* email */}
                    <View style={styles.email_wrapper}>
                        <Text style={styles.text_black20}>Email</Text>
                        <TouchableOpacity onPress={this.sendMail.bind(this)}>
                            <Text style={styles.email_text}>info@theheloapp.com</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.subtext2_wrapper}>
                        <Text style={styles.text_black18}>with any questions or</Text>
                        <Text style={styles.text_black18}>concerns and we WILL get</Text>
                        <Text style={styles.text_black18}>back to you! We love</Text>
                        <Text style={styles.text_black18}>hearing from fellow Hēlo</Text>
                        <Text style={styles.text_black18}>members and look forward</Text>
                        <Text style={styles.text_black18}>to chatting with you :)</Text>
                    </View>

                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
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
        paddingTop: "2%"
    },
    subtext1_wrapper: {
        width: "100%",
        height: "15%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    text_black18: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 18,
        lineHeight: 18
    },
    text_black20: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 20
    },
    email_wrapper: {
        width: "100%",
        height: "12%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    email_text: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 16,
        color: Global.colorButtonBlue
    },
    subtext2_wrapper: {
        width: "100%",
        height: "27%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    }
});