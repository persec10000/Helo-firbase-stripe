
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';
import Moment from 'moment';
import { LineChart } from "react-native-chart-kit";


const daysLabels = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"];
const daysLabelsFeb = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const chartWidth = Math.round(Global.screenWidth * 0.9);

export default class AdminIncome extends Component { //'AdminIncome'
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            month: 0, // 0~11
            year: 2019,
            current: {
                month: 0,
                year: 0,
            },
            isEndMonth: true,
            loading: true,

            total_earn: 0,
            sent_amount: 0,
            fetchedYear: 0,
            dataYear: {},
            dataMonth: [],
        };
    }

    componentDidMount() {
        Fire.shared.getIncomeStatistics().then((result) => {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            this.setState({
                month: month,
                year: year,
                current: {
                    month: month,
                    year: year,
                },
                total_earn: result.total_earn,
                sent_amount: result.sent_amount,
            })
            this.extractData(month, year);
        }).catch(() => { });
    }


    extractData(m, y) { // m:0~11 y:2019
        this.setState({
            loading: true,
        })
        if (y === this.state.fetchedYear) {
            const month = (m + 1).toString();
            const monthObj = this.state.dataYear[month] || {};
            let monthArray = [];
            let monthString = month;
            if (m < 9) monthString = '0' + monthString;
            const momentString = y + '-' + monthString;
            const nDaysOfMonth = Moment(momentString, "YYYY-MM").daysInMonth(); // "2013-02"
            for (let i = 0; i < nDaysOfMonth; i++) {
                monthArray[i] = monthObj[i] || 0;
            }
            this.setState({
                fetchedYear: y,
                dataMonth: monthArray,
                loading: false,
            })
        } else {
            Fire.shared.getIncomeOneYear(y).then((result) => {
                const month = (m + 1).toString();
                const monthObj = result[month] || {};
                let monthArray = [];
                let monthString = month;
                if (m < 9) monthString = '0' + monthString;
                const momentString = y + '-' + monthString;
                const nDaysOfMonth = Moment(momentString, "YYYY-MM").daysInMonth(); // "2013-02"
                for (let i = 0; i < nDaysOfMonth; i++) {
                    monthArray[i] = monthObj[i] || 0;
                }
                this.setState({
                    fetchedYear: y,
                    dataYear: result || {},
                    dataMonth: monthArray,
                    loading: false,
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                })
            })
        }
    }

    render_loading() {
        return (
            <View style={styles.indicator}>
                <ActivityIndicator size="large" color="#f39c12" />
            </View>
        )
    }

    pressMonthArrow(isNext) {
        let month = isNext ? this.state.month + 1 : this.state.month - 1;
        let year = this.state.year;
        if (month < 0) {
            month = 11;
            year -= 1;
        } else if (month > 11) {
            month = 0;
            year += 1;
        }
        if (month === this.state.current.month && year === this.state.current.year) {
            this.setState({
                isEndMonth: true
            })
        } else {
            this.setState({
                isEndMonth: false
            })
        }
        this.setState({
            month: month,
            year: year,
        })
        this.extractData(month, year);
    }

    renderDayLineChart(array) {
        return (
            <LineChart
                data={{
                    labels: this.state.month === 1 ? daysLabelsFeb : daysLabels,
                    datasets: [
                        {
                            data: array,
                        }
                    ]
                }}
                width={chartWidth}
                height={220}
                yAxisLabel={""}
                chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#fb8c00",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 2,
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 10
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                    },
                    strokeWidth: 2,
                }}
                bezier
                style={{
                    marginVertical: 5,
                    borderRadius: 10,
                }}
            />
        )
    }


    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'income'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.main_container}>

                    <Text style={styles.text_topquote}>amount of money earned by heloapp</Text>

                    <View style={styles.topamount_container}>
                        <View style={styles.topamount_wrapper}>
                            <Text style={styles.text_topamount}>$ {this.state.total_earn}</Text>
                        </View>
                    </View>


                    <Text style={styles.text_topquote}>amount of money sent</Text>

                    <View style={styles.topamount_container}>
                        <View style={styles.topamount_wrapper}>
                            <Text style={styles.text_topamount}>$ {this.state.sent_amount}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.chartheader}>
                    <Text style={styles.text_bold13}>income of helo per day</Text>
                </View>


                <View style={styles.monthpicker_wrapper}>

                    <TouchableOpacity onPress={this.pressMonthArrow.bind(this, false)} style={styles.arrow_wrapper}>
                        <Ionicons name="ios-arrow-back" size={25} color={'white'} />
                    </TouchableOpacity>

                    <View style={styles.month_wrapper}>
                        <Text style={styles.text_black15white}>{`${months[this.state.month]} ${this.state.year}`}</Text>
                    </View>

                    {this.state.isEndMonth ?
                        <View style={styles.f_01}></View>
                        :
                        <TouchableOpacity onPress={this.pressMonthArrow.bind(this, true)} style={styles.arrow_wrapper}>
                            <Ionicons name="ios-arrow-forward" size={25} color={'white'} />
                        </TouchableOpacity>
                    }
                </View>


                <View style={styles.chart_wrapper}>

                    {this.state.loading ?
                        this.render_loading()
                        :
                        <View style={styles.chart_subwrapper}>
                            {this.renderDayLineChart(this.state.dataMonth)}
                        </View>
                    }
                </View>


            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Global.colorLoginBack,
        flexDirection: "column"
    },
    indicator: {
        width: "100%",
        height: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    main_container: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "column"
    },
    text_topamount: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 20,
        marginRight: 20
    },
    topamount_wrapper: {
        minWidth: 200,
        height: "100%",
        backgroundColor: "lightgray",
        justifyContent: "center",
        alignItems: "flex-end"
    },
    topamount_container: {
        marginTop: 5,
        width: "100%",
        height: 45,
        paddingRight: 0,
        alignItems: "flex-end"
    },
    text_topquote: {
        marginTop: 10,
        fontFamily: Global.Nimbus_Bold,
        fontSize: 16
    },
    chartheader: {
        marginTop: 25,
        width: "100%",
        alignItems: "center"
    },
    text_bold13: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    monthpicker_wrapper: {
        marginTop: 5,
        width: "90%",
        alignSelf: "center",
        height: 50,
        backgroundColor: Global.colorButtonBlue,
        borderRadius: 5,
        flexDirection: "row"
    },
    arrow_wrapper: {
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center"
    },
    month_wrapper: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center"
    },
    text_black15white: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15,
        color: "white"
    },
    chart_wrapper: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "center"
    },
    chart_subwrapper: {
        width: "100%",
        alignItems: "center"
    },
    f_01: {
        flex: 0.1
    }
});  