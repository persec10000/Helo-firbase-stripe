
import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';
import Moment from 'moment';
import isEmpty from '@utils/isEmpty';

function timeConverter(timestamp) {
    const a = new Date(timestamp * 1);
    const monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month = monthsArray[a.getMonth()];
    let date = a.getDate();
    let time = month + ' ' + date;
    return time;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const imageHeight = 90;

export default class AdminSoldItems extends Component { //'AdminSoldItems'
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
            itemlist: [],
            noItems: false,
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
            },
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
        Fire.shared.getSoldItemsOneMonth(startTimeStamp, endTimeStamp).then((result) => {
            this.setState({
                itemlist: result,
                loading: false,
            })
            if (isEmpty(result)) {
                this.setState({
                    noItems: true,
                })
            } else {
                this.setState({
                    noItems: false,
                })
            }
        }).catch(error => {
            this.setState({
                loading: false,
            })
            Global.isDev && console.log(error)
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

    renderFlatListItem(item) {
        const date = timeConverter(item.time);
        return (

            <View style={styles.item_wrapper}>

                <View style={styles.item_pic_wrapper}>
                    <View style={styles.item_pic_subwrapper}>
                        <Image
                            source={{ uri: item.picture }}
                            style={styles.wh100}
                            resizeMode='contain' />
                    </View>
                    <View style={styles.item_title}>
                        <Text style={styles.text_bold15}>{item.title}</Text>
                        <Text style={styles.text_bold15}>{item.brand}</Text>
                    </View>
                </View>
                <View style={styles.item_price}>
                    <Text style={styles.text_bold15}>${item.price}</Text>
                    <Text style={[styles.text_bold15, { color: Global.colorButtonBlue }]}>{date}</Text>
                </View>

            </View>
        )
    }

    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'sold items'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.monthpicker_wrapper}>
                    <TouchableOpacity onPress={this.pressMonthArrow.bind(this, false)} style={styles.arrow_wrapper}>
                        <Ionicons name="ios-arrow-back" size={25} color={'white'} />
                    </TouchableOpacity>

                    <View style={styles.month_wrapper}>
                        <Text style={styles.text_black15white}>{`${months[this.state.month]} ${this.state.year}`}</Text>
                    </View>

                    {this.state.isEndMonth ?
                        <View style={styles.f01}></View>
                        :
                        <TouchableOpacity onPress={this.pressMonthArrow.bind(this, true)} style={styles.arrow_wrapper}>
                            <Ionicons name="ios-arrow-forward" size={25} color={'white'} />
                        </TouchableOpacity>
                    }
                </View>

                <ScrollView style={styles.w100}>
                    <View style={styles.items_wrapper}>


                        {this.state.loading &&
                            this.render_loading()
                        }
                        {this.state.noItems &&
                            <Text style={styles.noitem}>no items</Text>
                        }
                        {!this.state.loading &&
                            <FlatList
                                data={this.state.itemlist}
                                extraData={this.state}
                                renderItem={({ item }) => this.renderFlatListItem(item)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        }
                    </View>

                    <View style={{ height: 30 }}></View>

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
    indicator: {
        width: "100%",
        height: 80,
        justifyContent: "center",
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
    month_wrapper: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center"
    },
    text_bold15: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 15
    },
    wh100: {
        width: "100%",
        height: "100%"
    },
    item_wrapper: {
        marginTop: 20,
        width: Math.round(Global.screenWidth * 0.9),
        height: imageHeight,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    item_pic_wrapper: {
        height: imageHeight,
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    item_pic_subwrapper: {
        width: imageHeight,
        height: imageHeight
    },
    item_title: {
        marginLeft: 20,
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start"
    },
    item_price: {
        marginHorizontal: 20,
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    text_black15white: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15,
        color: "white"
    },
    items_wrapper: {
        width: "90%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "center"
    },
    w100: {
        width: "100%"
    },
    f01: {
        flex: 0.1
    },
    noitem: {
        marginTop: 30,
        fontFamily: Global.Nimbus_Black,
        fontSize: 15
    }
});  