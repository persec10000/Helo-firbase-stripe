
import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';
import Calendar from 'react-native-calendar-datepicker';
import Moment from 'moment';
import { LineChart } from "react-native-chart-kit";
import isEmpty from '@utils/isEmpty';


const hourLabels = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"];
const mainHeight = Math.round(Global.screenHeight - Global.TabBarHeight - Math.round(Global.screenWidth / 4));

export default class AdminEngagement extends Component { //'AdminEngagement'
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            eg_total: 0,
            pickDate: {},
            fetchMonthData: {},
            oneDayData: [],     // length:24
            fetchedMonth: '',   // '201908'
            loading: true,
            toptextHeight: 65,
            canlendarHeight: 0,
        };
    }

    componentDidMount() {
        const now = new Date();
        Fire.shared.getEngagementTotal().then((result) => {
            this.setState({
                eg_total: result,
            })
        })
        this.extractData(now.getDate(), now.getMonth() + 1, now.getFullYear());
    }

    extractData(d, m, y) { // m:1~12
        this.setState({
            loading: true,
        })
        let month = m.toString();
        if (m < 10) {
            month = '0' + month;
        }
        const monthForFetch = y.toString() + month;

        if (monthForFetch === this.state.fetchedMonth) {
            const onedayDataObj = this.state.fetchMonthData[d] || {};
            let onedayDataArray = []
            for (let i = 0; i < 24; i++) {
                if (onedayDataObj[`${i}`]) {
                    onedayDataArray.push(onedayDataObj[`${i}`]);
                } else {
                    onedayDataArray.push(0);
                }
            }
            this.setState({
                oneDayData: onedayDataArray,
                loading: false,
            })
        } else {
            Fire.shared.getEngagementOneMonth(m, y).then((result) => {
                if (isEmpty(result)) {
                    let onedayDataArray = []
                    for (let i = 0; i < 24; i++) {
                        onedayDataArray.push(0);
                    }
                    this.setState({
                        fetchMonthData: {},
                        oneDayData: onedayDataArray,
                        loading: false,
                        fetchedMonth: monthForFetch,
                    })
                } else {
                    const onedayDataObj = result[d] || {};
                    let onedayDataArray = []
                    for (let i = 0; i < 24; i++) {
                        if (onedayDataObj[`${i}`]) {
                            onedayDataArray.push(onedayDataObj[`${i}`]);
                        } else {
                            onedayDataArray.push(0);
                        }
                    }
                    this.setState({
                        fetchMonthData: result,
                        oneDayData: onedayDataArray,
                        loading: false,
                        fetchedMonth: monthForFetch,
                    })
                }
            })
        }
    }

    changeDate(date) { // moment type
        this.setState({ pickDate: date })
        const d = date.date();
        const m = date.month() + 1;
        const y = date.year();
        this.extractData(d, m, y);
    }

    render_loading() {
        return (
            <View style={styles.indicator}>
                <ActivityIndicator size="large" color="#f39c12" />
            </View>
        )
    }

    getTopTextHeight(event) {
        const { height } = event.nativeEvent.layout;
        this.setState({
            toptextHeight: height
        })
    }

    getCalendarHeight(event) {
        const { height } = event.nativeEvent.layout;
        this.setState({
            canlendarHeight: height
        })
    }

    render() {
        const bottomAreaHeight = mainHeight - this.state.toptextHeight - this.state.canlendarHeight - 50;
        const chartHeight = (bottomAreaHeight > 220) ? 220 : bottomAreaHeight;
        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'engagement'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.maincontainer}>
                    <View style={styles.mainsubcontainer}>

                        <View onLayout={(event) => this.getTopTextHeight(event)} style={{ width: '100%' }}>
                            <View style={styles.totaleg_wrapper}>
                                <Text style={styles.text_bold15}> total engagement</Text>
                                <Text style={styles.text_bold15}>{this.state.eg_total} </Text>
                            </View>
                        </View>



                        <View onLayout={(event) => this.getCalendarHeight(event)} style={styles.calendar_wrapper}>
                            <Calendar
                                onChange={(date) => this.changeDate(date)}
                                selected={this.state.pickDate}
                                minDate={Moment().subtract(6, 'months')}
                                maxDate={Moment().startOf('day')}
                                style={styles.calendar}
                                barView={{
                                    backgroundColor: Global.colorButtonBlue,
                                    padding: 10,
                                }}
                                barText={{
                                    fontWeight: 'bold',
                                    color: 'white',
                                }}
                                dayHeaderView={{
                                    backgroundColor: 'lightgray',
                                    borderBottomColor: 'gray',
                                }}
                                dayHeaderText={{
                                    fontWeight: 'bold',
                                    color: 'black',
                                }}
                                dayRowView={{
                                    borderColor: 'lightgray',
                                    height: 30,
                                }}
                                dayText={{
                                    color: 'black',
                                }}
                                dayDisabledText={{
                                    color: 'gray',
                                }}
                                dayTodayText={{
                                    fontWeight: 'bold',
                                    color: 'red',
                                }}
                                daySelectedText={{
                                    fontWeight: 'bold',
                                    backgroundColor: Global.colorButtonBlue,
                                    color: 'white',
                                    borderRadius: 10,
                                    borderColor: "transparent",
                                    overflow: 'hidden',
                                }}
                                monthText={{
                                    color: 'black',
                                    borderColor: 'black',
                                }}
                                monthDisabledText={{
                                    color: 'gray',
                                    borderColor: 'gray',
                                }}
                                monthSelectedText={{
                                    fontWeight: 'bold',
                                    backgroundColor: 'blue',
                                    color: 'white',
                                    overflow: 'hidden',
                                }}
                                yearMinTintColor={'blue'}
                                yearMaxTintColor={'gray'}
                                yearText={{
                                    color: 'black',
                                }}
                            />
                        </View>


                        <View style={styles.chart_quote}>
                            <Text style={styles.text_bold15}>number of engagement per hour</Text>
                        </View>

                        {this.state.loading ?

                            this.render_loading()
                            :
                            <LineChart
                                data={{
                                    labels: hourLabels,
                                    datasets: [
                                        {
                                            data: this.state.oneDayData
                                        }
                                    ]
                                }}
                                width={Math.round(Global.screenWidth * 0.9)} // from react-native
                                height={chartHeight}
                                yAxisLabel={""}
                                chartConfig={{
                                    backgroundColor: "#e26a00",
                                    backgroundGradientFrom: "#fb8c00",
                                    backgroundGradientTo: "#ffa726",
                                    decimalPlaces: 0,
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

                        }

                    </View>

                </View>

                <View style={{ height: Global.TabBarHeight }}></View>

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
    text_bold15: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 15
    },
    totaleg_wrapper: {
        marginTop: 15,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    maincontainer: {
        width: "100%",
        height: mainHeight
    },
    mainsubcontainer: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "center"
    },
    calendar_wrapper: {
        marginTop: 15,
        width: "100%",
        alignItems: "center"
    },
    calendar: {
        width: "100%",
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5
    },
    chart_quote: {
        marginTop: 10,
        width: "100%",
        alignItems: "center"
    }
});  