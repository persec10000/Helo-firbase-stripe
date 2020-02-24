
import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';

export default class Rules extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={styles.container}>

                <AppHeaderArrow title={'rules'} pressArrow={() => this.props.navigation.goBack()} />

                <ScrollView style={styles.main_container}>

                    <View>
                        <Text style={styles.text_bold13}> Welcome to Hēlo! We are a resale app that’s exclusive to college students. Buy and sell right on your own campus! We consider Hēlo to be a community, and believe members should behave with respect and dignity on the app :) </Text>
                        <Text style={styles.text_bold13}>{'\n\n\n1. We expect our users to remain civil when contacting other users.\n\n2. Hēlo is so much more than other resale apps because you are buying and selling from your friends, your peers, your classmates. As a result, we expect the platform to remain a bully-free environment.\n\n3. Hēlo is a safe environment for all to buy and sell, everyone is welcome in our community if they are able to maintain this environment. If not, we reserve the right to close accounts of abusive users.\n\n4. Reporting someone: \nAs noted on the settings page, you may witness or experience another user abusing their access to our app, if this is the case, you can easily report that user and explain the situation. We encourage all users to hold each other accountable for their actions.'}</Text>
                    </View>

                </ScrollView>

                <View style={{ height: Global.TabBarHeight }}></View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Global.colorLoginBack,
        alignItems: 'center'
    },
    main_container: {
        flex: 1,
        width: '85%',
        height: '100%',
        flexDirection: 'column',
        paddingTop: '5%'
    },
    text_bold13: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13,
        textAlign: 'justify'
    }
});