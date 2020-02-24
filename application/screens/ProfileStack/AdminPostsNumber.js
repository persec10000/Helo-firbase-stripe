
import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';
import Moment from 'moment';
import { LineChart, BarChart } from "react-native-chart-kit";

const daysLabels = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"];
const daysLabelsFeb = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const categoryLabels = ["clothes", "tech", "home", "book", "other"]
const chartWidth = Math.round(Global.screenWidth * 0.9);

export default class AdminPostsNumber extends Component { //'AdminPostsNumber'
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            month: 0,
            year: 2019,
            current: {
                month: 0,
                year: 0,
            },
            isEndMonth: true,
            loading: true,
            totalnumberOneMonth: 0,
            postsNumberArrayOneMonth: [],
            postsNumberArrayPerCategoryOneMonth: [],
            postsNumberArrayPerDayOneMonthClothes: [],
            postsNumberArrayPerDayOneMonthTech: [],
            postsNumberArrayPerDayOneMonthHome: [],
            postsNumberArrayPerDayOneMonthBook: [],
            postsNumberArrayPerDayOneMonthOther: [],
        };
    }

    componentDidMount() {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        this.setState({
            month: month,
            year: year,
            current: {
                month: month,
                year: year,
            }
        })
        this.extractData(month, year);

    }

    extractData(m, y) { // m:0~11 y:2019
        this.setState({
            loading: true,
        })

        let month = (m + 1).toString();
        if (m + 1 < 10) {
            month = '0' + month;
        }
        const momentString = y + '-' + month;
        const nDaysOfMonth = Moment(momentString, "YYYY-MM").daysInMonth(); // "2013-02"
        const startTimeStamp = new Date(y, m, 1).getTime();
        const endTimeStamp = new Date(y, m, nDaysOfMonth).getTime() + (1 * 24 * 3600 * 1000);
        Fire.shared.getPostsNumberOneMonth(startTimeStamp, endTimeStamp).then((result) => {
            let postsNumberArrayOneMonth = [];
            let postsNumberArrayPerDayOneMonthClothes = [];
            let postsNumberArrayPerDayOneMonthTech = [];
            let postsNumberArrayPerDayOneMonthHome = [];
            let postsNumberArrayPerDayOneMonthBook = [];
            let postsNumberArrayPerDayOneMonthOther = [];
            for (let i = 0; i < nDaysOfMonth; i++) {
                postsNumberArrayOneMonth[i] = 0;
                postsNumberArrayPerDayOneMonthClothes[i] = 0;
                postsNumberArrayPerDayOneMonthTech[i] = 0;
                postsNumberArrayPerDayOneMonthHome[i] = 0;
                postsNumberArrayPerDayOneMonthBook[i] = 0;
                postsNumberArrayPerDayOneMonthOther[i] = 0;
            }
            let postsNumberArrayPerCategoryOneMonth = [];
            for (let i = 0; i < 5; i++) {
                postsNumberArrayPerCategoryOneMonth[i] = 0;
            }

            for (let i = 0; i < result.length; i++) {
                const time = result[i].time;
                const category = result[i].category; // 1~5
                const postdate = Math.floor((time - startTimeStamp) / (24 * 3600 * 1000))
                postsNumberArrayOneMonth[postdate] += 1;
                postsNumberArrayPerCategoryOneMonth[category - 1] += 1;
                if (category === 1) {
                    postsNumberArrayPerDayOneMonthClothes[postdate] += 1;
                } else if (category === 2) {
                    postsNumberArrayPerDayOneMonthTech[postdate] += 1;
                } else if (category === 3) {
                    postsNumberArrayPerDayOneMonthHome[postdate] += 1;
                } else if (category === 4) {
                    postsNumberArrayPerDayOneMonthBook[postdate] += 1;
                } else if (category === 5) {
                    postsNumberArrayPerDayOneMonthOther[postdate] += 1;
                }
            }
            this.setState({
                loading: false,
                totalnumberOneMonth: result.length,
                postsNumberArrayOneMonth: postsNumberArrayOneMonth,
                postsNumberArrayPerCategoryOneMonth: postsNumberArrayPerCategoryOneMonth,
                postsNumberArrayPerDayOneMonthClothes: postsNumberArrayPerDayOneMonthClothes,
                postsNumberArrayPerDayOneMonthTech: postsNumberArrayPerDayOneMonthTech,
                postsNumberArrayPerDayOneMonthHome: postsNumberArrayPerDayOneMonthHome,
                postsNumberArrayPerDayOneMonthBook: postsNumberArrayPerDayOneMonthBook,
                postsNumberArrayPerDayOneMonthOther: postsNumberArrayPerDayOneMonthOther,
            })
        }).catch((error) => {
            Global.isDev && console.log(error)
            this.setState({
                loading: false,
            })
        });

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
                    decimalPlaces: 0, // optional, defaults to 2dp
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 10
                    },
                    propsForDots: {
                        r: "0",
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

    renderBarChart(array) {
        return (
            <BarChart
                data={{
                    labels: categoryLabels,
                    datasets: [
                        {
                            data: array,
                        }
                    ]
                }}
                width={chartWidth}
                height={220}
                yAxisLabel={''}
                chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#fb8c00",
                    backgroundGradientTo: "#ffa726",
                    decimalPlaces: 0,
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
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

                <AppHeaderArrow title={'posts'} pressArrow={() => this.props.navigation.goBack()} />

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

                <ScrollView style={styles.main_container}>
                    <View style={styles.chart_wrapper}>


                        {this.state.loading &&
                            this.render_loading()
                        }
                        {!this.state.loading &&
                            <View style={styles.charts_wrapper}>
                                <View style={styles.barchart_wrapper}>
                                    <Text style={styles.text_bold13}>number of posts per category</Text>
                                    <Text style={styles.text_black13}> (total {this.state.totalnumberOneMonth})</Text>
                                </View>
                                {this.renderBarChart(this.state.postsNumberArrayPerCategoryOneMonth)}

                                <Text style={styles.chart_quote}>number of posts per day</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayOneMonth)}

                                <Text style={styles.chart_quote}>number of posts per day - clothes</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayPerDayOneMonthClothes)}

                                <Text style={styles.chart_quote}>number of posts per day - tech</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayPerDayOneMonthTech)}

                                <Text style={styles.chart_quote}>number of posts per day - home</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayPerDayOneMonthHome)}

                                <Text style={styles.chart_quote}>number of posts per day - book</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayPerDayOneMonthBook)}

                                <Text style={styles.chart_quote}>number of posts per day - other</Text>
                                {this.renderDayLineChart(this.state.postsNumberArrayPerDayOneMonthOther)}
                            </View>
                        }
                    </View>

                    <View style={{ height: 50 }}></View>

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
        flexDirection: "column"
    },
    chart_quote: {
        marginTop: 5,
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    text_bold13: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    text_black13: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 13
    },
    chart_wrapper: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "center"
    },
    monthpicker_wrapper: {
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
    text_black15white: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15,
        color: "white"
    },
    month_wrapper: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center"
    },
    barchart_wrapper: {
        marginTop: 15,
        flexDirection: "row"
    },
    charts_wrapper: {
        width: "100%",
        alignItems: "center"
    },
    main_container: {
        width: "100%"
    },
    indicator: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    f_01: {
        flex: 0.1
    }
});  