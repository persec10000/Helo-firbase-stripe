import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCardInput } from 'react-native-credit-card-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';

const okcancel_btnheight = Math.round(Global.screenWidth * 0.1);

export default class StripeCardInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isChanged: false,
            cardInputValue: {},
        }
    }

    componentDidMount() {
        Fire.shared.getStripeCardInfo().then((card) => {
            if (isEmpty(card)) {
                return;
            }
            this.CCInput.setValues({
                number: card.number,
                expiry: card.expiry,
                cvc: card.cvc
            });

        }).catch((error) => Global.isDev && console.log(error));
    }

    pressCardOkCancel(isOk) {
        if (isOk) {
            if (this.state.isChanged) {
                if (!this.state.cardInputValue.valid) return;
                Fire.shared.setStripeCardInfo(this.state.cardInputValue.values).then(() => {
                    Toast.show({ text: Strings.ST23, position: 'bottom', duration: Global.ToastDuration })
                    this.props.pressOkCancel(true, this.state.cardInputValue.values);
                })
            } else {
                this.props.pressOkCancel(false, null);
            }
        } else {
            this.props.pressOkCancel(false, null);
        }
    }

    onCardChange = (form) => {
        this.setState({
            isChanged: true,
            cardInputValue: form
        })
    }

    render() {
        return (
            <KeyboardAwareScrollView scrollEnabled={false} contentContainerStyle={{ flex: 1 }} >
                <View style={{ flex: 1 }} >

                    <View style={styles.cardinput_wrapper}>
                        <CreditCardInput ref={(control) => this.CCInput = control} onChange={this.onCardChange} />
                    </View>

                    <View style={styles.okcancel_wrapper}>

                        <TouchableOpacity style={styles.okcancel} onPress={this.pressCardOkCancel.bind(this, false)}>
                            <Text style={styles.text_okcancel}>cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.okcancel} onPress={this.pressCardOkCancel.bind(this, true)}>
                            <Text style={styles.text_okcancel}>ok</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    cardinput_wrapper: {
        position: "absolute",
        top: Math.round(Global.screenHeight * 0.2)
    },
    okcancel_wrapper: {
        position: "absolute",
        bottom: Math.round(Global.screenHeight * 0.2),
        width: "100%",
        height: okcancel_btnheight,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    okcancel: {
        width: "30%",
        height: "100%",
        backgroundColor: Global.colorButtonBlue,
        justifyContent: "center",
        alignItems: "center"
    },
    text_okcancel: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15,
        color: "white",
        lineHeight: okcancel_btnheight
    }
});  