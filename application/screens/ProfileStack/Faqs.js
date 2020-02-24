
import React, { Component } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';

const faqs = [
    {
        title: 'How do I close my account?',
        text: 'On your profile page, click the gear in the top right corner. Under my account, click account settings. Click “close account” to proceed.'
    },
    {
        title: 'How do I change my venmo account?',
        text: 'On your profile page, click the gear in the top right corner. Under my account, click account settings. Click “change venmo account” to proceed.'
    },
    {
        title: 'When do I receive the money from my sales?',
        text: 'After a pickup time and date has been set, Hēlo will release your earnings after both parties  have confirmed pickup or after 3 days have passed from the set pickup time.'
    },
    {
        title: 'What do I do if the buyer didn’t show up?',
        text: 'If the buyer does not show up you have the option to reschedule the pickup or receive a penalty fee from the buyer. However, you will not receive earnings for the sale. You may also review the buyer and rate your experience with them.'
    },
    {
        title: 'What do I do if the seller didn’t show up?',
        text: 'If the seller does not show up you have the option to reschedule the pickup or get your money back with a penalty fee from the seller. You may also review the seller and rate your experience with them.'
    },
    {
        title: 'How do I edit my profile?',
        text: 'On your profile page, click the gear in the top right corner. Under my profile, click edit profile.'
    },
    {
        title: 'How do I sell safely?',
        text: 'When chatting with other users, it’s important to maintain your privacy and keep your private information safe. Similarly, when meeting up for a sale, opt for a public location during the day. We suggest your campus quad.'
    },
    {
        title: 'How do I buy on Hēlo?',
        text: 'To buy on Hēlo is a simple process. Simply click the “Buy” button at the bottom of every post and choose a pickup date, time, and location; we’ll send that pickup info to the seller in a chat, and they can accept it, or propose a different date/time. Meet your seller at the determined time and location and enjoy your new purchase! No need to use cash, Hēlo takes care of all payments through the app.'
    },
    {
        title: 'Why do I need Venmo?',
        text: 'We do not have our own payment platform, so we opted to use Venmo as it is the most accessible and popular for college students.'
    },
    {
        title: 'What is vacation mode?',
        text: 'If you’re away from campus and can’t complete sales, go on vacation mode! It will tell your buyers when you’re back, and when they can start buying from your store! :) If someone buys your item but you are not available to drop it off, you might be penalized, so be sure to set your vacation mode! T'
    },
    {
        title: 'How do I set vacation mode?',
        text: 'On your profile page, click the gear in the top right cornder, Under my profile, click vacation mode. Turn vacation mode on or off. If you turn it on, you’ll have the option to enter the date when you’ll be returning, which you can change at any time by heading back to this page.'
    },
    {
        title: 'How does credit work?',
        text: 'For first time buyers that have been invited to the app by friends, we offer $5 credit for their first purchase, this credit can be used to purchase goods on Hēlo, but cannot be transferred into user’s venmo accounts. Use your discount code at checkout to have this credit applied to your purchase.'
    },
    {
        title: 'How do I make sales?',
        text: 'For making the best sales, think about how you present your items. Are the photos dark or blurry? Are the descriptions vague? Be detailed with your descriptions, offering dimensions and any flaws that the item may have. Thoroughness will increase buyer’s trust in you. Include bright and clear photos. Finally, share, share, share! Take advantage of your Instagram, Twitter, and Facebook followings.'
    },
]

export default class Faqs extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            displayData: faqs,
        };
    }
    searchFilterFunction = text => {
        const newData = faqs.filter(function (item) {
            const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        this.setState({
            displayData: newData,
        });
    };

    renderFaqs() {
        let items = [];
        for (let i = 0; i < this.state.displayData.length; i++) {
            items.push(
                <View key={i}>
                    <Text key={i + 'title'} style={styles.itemTitle}>{'\n'}{this.state.displayData[i].title}</Text>
                    <Text key={i + 'text'} style={styles.itemContent}>{this.state.displayData[i].text}</Text>
                </View>
            )
        }
        return (
            <ScrollView style={{ paddingHorizontal: '7%' }}>
                {items}
                <View style={{ height: 20 }}></View>
            </ScrollView>
        );
    }


    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={`faq's`} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.main_container}>

                    {/* search bar */}
                    <View style={styles.searchbar_wrapper}>
                        <View style={styles.searchbar_subwrapper}>
                            <Ionicons name="ios-search" size={25} color={'black'} />
                            <TextInput maxLength={Global.TM50} autoCapitalize='none' multiline={false} numberOfLines={1} placeholder="search by keyword" placeholderTextColor='black' style={styles.searchbar_input} onChangeText={text => this.searchFilterFunction(text)} />
                        </View>
                    </View>

                    {this.renderFaqs()}

                    <View style={{ height: Global.TabBarHeight }}></View>

                </View>

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
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    searchbar_wrapper: {
        width: '85%',
        height: 40,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },
    searchbar_subwrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchbar_input: {
        width: '95%',
        paddingLeft: 10,
        fontFamily: Global.Nimbus_Black,
        fontSize: 15,
        fontWeight: 'normal'
    },
    itemTitle: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 14,
        textAlign: 'justify'
    },
    itemContent: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13,
        textAlign: 'justify'
    }
});