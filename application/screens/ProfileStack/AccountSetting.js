import React, { Component } from 'react';
import * as firebase from 'firebase';
import { TouchableOpacity, View, ScrollView, Text, TextInput, StyleSheet } from 'react-native';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import Global from '@utils/GlobalValue';
import StripeCardInput from "@components/StripeCardInput";
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '../../utils/Firebase';
import { removeUser } from '@utils/GlobalFunction';

export default class AccountSettings extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            confirmpasswrod: '',
            showCardInput: false,
            showCloseAccountConfirmBtns: false,
        }
    }

    pressChangeStripeButton() {
        this.setState({
            showCardInput: true
        })
    }

    pressdone() {
        const { password, confirmpasswrod } = this.state;
        if (password !== '') {
            if (password.length < 8) {
                Toast.show({ text: Strings.ST11, position: 'bottom', duration: Global.ToastDuration })
                return;
            } else if (password === confirmpasswrod) {
                this.changePassword(password);
            } else {
                Toast.show({ text: Strings.ST37, position: 'bottom', duration: Global.ToastDuration })
                return;
            }
        }
    }

    changePassword(newPassword) {
        let user = firebase.auth().currentUser;
        user.updatePassword(newPassword).then(() => {
            Toast.show({ text: Strings.ST56, position: 'bottom', duration: Global.ToastDuration });
            this.props.navigation.goBack();
        }).catch((error) => {
            Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration });
            Global.isDev && console.log('error:', error);
        });
    }

    pressOkCancel(isOk, cardInfo) {
        this.setState({
            showCardInput: false,
        })
    }

    pressCloseAccount() {
        this.setState({ showCloseAccountConfirmBtns: true })
    }

    pressCloseAccountOkCancel(isOk) {
        if (isOk) {
            Fire.shared.closeAccount().then(() => {
                removeUser(Fire.shared.uid);
                Toast.show({ text: Strings.ST57, position: 'bottom', duration: Global.ToastDuration });
                this.props.navigation.navigate('LogoutScreen')
            });

        } else {
            this.setState({ showCloseAccountConfirmBtns: false })
        }
    }

    render() {

        if (this.state.showCardInput) {
            return (
                <StripeCardInput pressOkCancel={this.pressOkCancel.bind(this)} />
            )
        }

        return (
            <ScrollView keyboardShouldPersistTaps={'never'}>
                <View style={styles.container}>

                    <AppHeaderArrow title={'account settings'} pressArrow={() => this.props.navigation.goBack()} />

                    <View style={styles.main_container}>

                        {/* change password & confirm password */}
                        <View style={styles.changepass_wrapper}>
                            <TextInput maxLength={Global.TM30} multiline={false} style={styles.item_input} placeholder="change password" placeholderTextColor='black' onChangeText={text => this.setState({ password: text })}
                            />
                        </View>

                        <View style={styles.comment_wrapper}>
                            <Text style={styles.text_passcomment}>8 characters</Text>
                        </View>

                        <View style={styles.confirmpass_wrapper}>
                            <TextInput maxLength={Global.TM30} multiline={false} style={styles.item_input} placeholder="confirm password" placeholderTextColor='black' onChangeText={text => this.setState({ confirmpasswrod: text })}
                            />
                        </View>


                        {/* payment button */}
                        <View style={styles.paybtn_wrapper}>
                            <TouchableOpacity onPress={this.pressChangeStripeButton.bind(this)} style={styles.paybtn} >
                                <Text style={styles.paybtn_text}>change payment info</Text>
                            </TouchableOpacity>
                        </View>

                        {/* close account */}
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={this.pressCloseAccount.bind(this)} >
                                <Text style={styles.text_bold13}>close account :(</Text>
                            </TouchableOpacity>
                        </View>

                        {this.state.showCloseAccountConfirmBtns &&
                            <View style={styles.closeaccount_confirm}>
                                <Text style={styles.text_bold14}>Do you really want to</Text>
                                <Text style={styles.text_bold14}>close your account?</Text>
                            </View>
                        }
                        {this.state.showCloseAccountConfirmBtns &&
                            <View style={styles.closeaccount_btns_wrapper}>
                                <TouchableOpacity style={styles.closeaccount_btn} onPress={this.pressCloseAccountOkCancel.bind(this, false)}>
                                    <Text style={styles.closeaccount_btntext}>cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.closeaccount_btn} onPress={this.pressCloseAccountOkCancel.bind(this, true)}>
                                    <Text style={styles.closeaccount_btntext}>ok</Text>
                                </TouchableOpacity>
                            </View>
                        }

                        {/* done */}
                        <TouchableOpacity style={styles.done_wrapper} onPress={this.pressdone.bind(this)}>
                            <Text style={styles.done_text}>done</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    item_input: {
        width: "100%",
        fontFamily: Global.Nimbus_Black,
        fontSize: 16,
        paddingTop: 15,
        fontWeight: "normal"
    },
    container: {
        flex: 1,
        height: Global.screenHeight,
        backgroundColor: Global.colorLoginBack,
        alignItems: "center"
    },
    main_container: {
        flex: 1,
        width: "85%",
        height: "100%",
        flexDirection: "column",
        paddingTop: "5%"
    },
    done_wrapper: {
        alignSelf: "center",
        position: "absolute",
        bottom: Global.bottomBottomButtonWithTab
    },
    done_text: {
        color: "#2152a5",
        fontFamily: Global.Nimbus_Black,
        fontSize: 16
    },
    text_bold13: {
        color: "black",
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    paybtn_text: {
        lineHeight: Math.round(Global.screenHeight * 0.08),
        color: "white",
        fontFamily: Global.Nimbus_Black,
        fontSize: 15
    },
    paybtn_wrapper: {
        width: "100%",
        height: Math.round(Global.screenHeight * 0.08),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30
    },
    paybtn: {
        backgroundColor: Global.colorButtonBlue,
        width: "80%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    changepass_wrapper: {
        width: "100%",
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    comment_wrapper: {
        justifyContent: "center",
        alignItems: "flex-start"
    },
    confirmpass_wrapper: {
        width: "100%",
        justifyContent: "flex-end",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        paddingTop: 10,
        marginBottom: 60
    },
    text_passcomment: {
        color: 'gray',
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13,
        paddingTop: 5
    },
    closeaccount_confirm: {
        width: '100%',
        marginTop: 20,
        flexDirection: 'column',
        alignItems: 'center'
    },
    text_bold14: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 14
    },
    closeaccount_btns_wrapper: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 20,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    closeaccount_btn: {
        width: '30%',
        height: '100%',
        backgroundColor: Global.colorButtonBlue,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeaccount_btntext: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 14,
        color: 'white',
        lineHeight: 30
    }
});