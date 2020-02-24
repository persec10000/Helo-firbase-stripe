
import React, { Component } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-datepicker';
import { Toast } from 'native-base'
import Strings from '@utils/Strings';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import AppHeaderArrow from '@components/AppHeaderArrow';

const buttonHeight = Math.round(Global.screenHeight * 0.07);
const buttonBorderRadius = Math.round(buttonHeight * 0.35);

export default class VacationMode extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            vacation: false,
            vacationBackDate: '',
            previousVacation: false,
            dateBoxMin: '',
            dateBoxMax: '',
        };
    }
    componentDidMount() {
        const now = new Date();
        const todayDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
        const nextyear = (now.getMonth() + 1) + '/' + now.getDate() + '/' + (now.getFullYear() + 1);
        this.setState({
            dateBoxMin: todayDate, // '08/23/2019'
            dateBoxMax: nextyear,
        })
        this.getInfo();
    }

    getInfo() {
        Fire.shared.getUserProfile().then((res) => {
            this.setState({
                vacation: res.vacation ? res.vacation : false,
                vacationBackDate: res.vacation && res.vacationBackDate ? res.vacationBackDate : '',
                previousVacation: res.vacation ? res.vacation : false,
            })
        }).catch((err) => Global.isDev && console.log(err));
    }

    pressDone() {
        if (this.state.previousVacation === this.state.vacation) {
            return;
        }
        if (this.state.vacation && this.state.vacationBackDate === '') {
            Toast.show({ text: Strings.ST40, position: 'bottom', duration: Global.ToastDuration })
            return;
        }
        const updateprofileinfo = { vacation: this.state.vacation, vacationBackDate: this.state.vacationBackDate };
        Fire.shared.updateProfile(updateprofileinfo).then(() => {
            if (this.state.vacation) {
                this.setState({
                    previousVacation: true
                })
                Toast.show({ text: Strings.ST41, position: 'bottom', duration: Global.ToastDuration })
            } else {
                this.setState({
                    previousVacation: false
                })
                Toast.show({ text: Strings.ST42, position: 'bottom', duration: Global.ToastDuration })
            }
        });
    }


    render() {

        return (

            <View style={styles.container}>

                {/* hearder */}
                <AppHeaderArrow title={'vacation mode'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.main_container}>

                    <View>
                        <Text style={styles.detailtext}>If you’re away from campus and can’t complete sales, go on vacation mode! It will tell your buyers when you’re back, and when they can start buying from your store! :) If someone buys your item but you are not available to drop it off, you might be penalized, so be sure to set your vacation mode!</Text>
                    </View>

                    <View style={{ height: '12%' }}></View>

                    {/* vacation mode button */}
                    <View style={styles.onoff_container}>

                        <TouchableOpacity
                            onPress={() => this.setState({ vacation: !this.state.vacation })}
                            style={[styles.onoff_switch, { alignItems: this.state.vacation ? 'flex-start' : 'flex-end' }]}>


                            {this.state.vacation ?
                                <View style={styles.on_wrapper}>
                                    <Text style={[styles.onofftext, { color: 'white' }]}>on</Text>
                                </View>
                                :
                                <View style={styles.off_wrapper}>
                                    <Text style={[styles.onofftext, { color: 'white' }]}>off</Text>
                                </View>
                            }



                        </TouchableOpacity>
                    </View>

                    {this.state.vacation &&
                        <View style={styles.subtext2_wrapper}>
                            <Text style={styles.text_black20}>vacation mode is on</Text>
                            <Text style={styles.text_bold20}>when will you be back?</Text>
                        </View>
                    }
                    {this.state.vacation &&
                        <View style={styles.datepicker_container}>

                            <Text style={styles.text_bold15}>date  </Text>

                            <DatePicker
                                date={this.state.vacationBackDate}
                                minDate={this.state.dateBoxMin}
                                maxDate={this.state.dateBoxMax}
                                mode="date"
                                format="MM/DD/YYYY"
                                // hideText
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                onDateChange={(date) => { this.setState({ vacationBackDate: date }) }}
                            />
                        </View>
                    }

                    {/* done */}
                    <TouchableOpacity style={styles.done_wrapper} onPress={this.pressDone.bind(this)}>
                        <Text style={styles.done_text}>done</Text>
                    </TouchableOpacity>

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
        paddingTop: "10%"
    },
    detailtext: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 13,
        lineHeight: 14,
        textAlign: "justify"
    },
    onoff_container: {
        width: "100%",
        height: buttonHeight,
        alignItems: "center"
    },
    onoff_switch: {
        width: "50%",
        height: "100%",
        borderRadius: buttonBorderRadius,
        backgroundColor: '#dcdcdb',
    },
    onofftext: {
        lineHeight: buttonHeight,
        fontFamily: Global.Nimbus_Black,
        fontSize: 20
    },
    text_black20: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 20
    },
    text_bold20: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 20
    },
    subtext2_wrapper: {
        paddingTop: 25,
        width: "100%",
        height: "20%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    off_wrapper: {
        width: "60%",
        height: "100%",
        backgroundColor: Global.colorButtonBlue,
        borderRadius: buttonBorderRadius,
        justifyContent: "center",
        alignItems: "center"
    },
    on_wrapper: {
        width: "60%",
        height: "100%",
        backgroundColor: Global.colorButtonBlue,
        borderRadius: buttonBorderRadius,
        justifyContent: "center",
        alignItems: "center"
    },
    datepicker_container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    text_bold15: {
        color: "black",
        fontFamily: Global.Nimbus_Bold,
        fontSize: 15
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
    }
});