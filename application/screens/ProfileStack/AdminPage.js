
import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Global from '@utils/GlobalValue';
import AppHeaderArrow from '@components/AppHeaderArrow';
import Fire from '@utils/Firebase';

export default class AdminPage extends Component { //'AdminPage'
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            show_userstatistics: false,
            show_posts: false,
            loading_userstatistics: false,
            user_stackinfo: {
                totalusers: 0,
                men: 0,
                women: 0,
                notsay: 0,
                visitors_oneday: 0,
            },
        };
    }

    pressUserStatistics() {
        const newstatus = !this.state.show_userstatistics;
        this.setState({ show_userstatistics: newstatus })
        if (newstatus && this.state.user_stackinfo.totalusers === 0) {
            this.setState({ loading_userstatistics: true });
            Fire.shared.getUserStatistics().then((result) => {
                const totalusers = result.men + result.women + result.notsay;
                this.setState({
                    user_stackinfo: {
                        totalusers: totalusers,
                        men: result.men,
                        women: result.women,
                        notsay: result.notsay,
                        visitors_oneday: result.visitors_oneday,
                    },
                    loading_userstatistics: false,
                })
            }).catch(() => { this.setState({ loading_userstatistics: false }) });
        }
    }

    pressPosts() {
        const newstatus = !this.state.show_posts;
        this.setState({ show_posts: newstatus })
    }

    render_loading() {
        return (
            <View style={styles.indicator}>
                <ActivityIndicator size="large" color="#f39c12" />
            </View>
        )
    }

    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'admin page'} pressArrow={() => this.props.navigation.goBack()} />

                <ScrollView style={styles.main_container}>
                    <View style={styles.main_area}>


                        {/* user statistics */}
                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity onPress={this.pressUserStatistics.bind(this)} >
                                <Text style={styles.text_black17blue}>user statistics</Text>
                            </TouchableOpacity>
                        </View>
                        {this.state.loading_userstatistics &&
                            this.render_loading()
                        }
                        {(this.state.show_userstatistics && !this.state.loading_userstatistics) &&
                            <View style={styles.user_area}>
                                <View style={styles.user_itemwrapper}>
                                    <Text style={styles.text_bold15}>number of users</Text>
                                    <Text style={styles.text_bold15}>{this.state.user_stackinfo.totalusers}</Text>
                                </View>

                                <View style={[styles.user_itemwrapper, { paddingLeft: 50 }]}>
                                    <Text style={styles.text_regular15}>men</Text>
                                    <Text style={styles.text_regular15}>{this.state.user_stackinfo.men}</Text>
                                </View>

                                <View style={[styles.user_itemwrapper, { paddingLeft: 50 }]}>
                                    <Text style={styles.text_regular15}>women</Text>
                                    <Text style={styles.text_regular15}>{this.state.user_stackinfo.women}</Text>
                                </View>

                                <View style={[styles.user_itemwrapper, { paddingLeft: 50 }]}>
                                    <Text style={styles.text_regular15}>not to say</Text>
                                    <Text style={styles.text_regular15}>{this.state.user_stackinfo.notsay}</Text>
                                </View>

                                <View style={styles.user_itemwrapper}>
                                    <Text style={styles.text_bold15}>number of visits a day</Text>
                                    <Text style={styles.text_bold15}>{this.state.user_stackinfo.visitors_oneday}</Text>
                                </View>
                            </View>
                        }


                        {/* income statistics */}
                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminIncome')}>
                                <Text style={styles.text_black17blue}>income</Text>
                            </TouchableOpacity>
                        </View>



                        {/* engagement statistics */}
                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminEngagement')}>
                                <Text style={styles.text_black17blue}>engagement</Text>
                            </TouchableOpacity>
                        </View>



                        {/* posts statistics */}
                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity onPress={this.pressPosts.bind(this)}>
                                <Text style={styles.text_black17blue}>posts</Text>
                            </TouchableOpacity>
                        </View>
                        {this.state.show_posts &&
                            <View style={styles.postitems}>

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminPostsNumber')} style={{ marginTop: 20 }}>
                                    <Text style={styles.text_bold15blue}>number of posts per day</Text>
                                </TouchableOpacity>


                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminSoldNumber')} style={{ marginTop: 20 }}>
                                    <Text style={styles.text_bold15blue}>number of sold items per day</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminSoldItems')} style={{ marginTop: 20 }}>
                                    <Text style={styles.text_bold15blue}>sold items</Text>
                                </TouchableOpacity>
                            </View>
                        }


                        {/* report user */}
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AdminReportUser')}>
                            <Text style={[styles.text_black17blue, { marginTop: 30 }]}>reported user list</Text>
                        </TouchableOpacity>


                        {/* cleaning */}
                        {/* <TouchableOpacity>
                            <Text style={[styles.text_black17blue, { marginTop: 30 }]}>cleaning</Text>
                        </TouchableOpacity> */}


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
    text_bold15blue: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 15,
        color: Global.colorButtonBlue
    },
    text_regular15: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 15
    },
    user_itemwrapper: {
        marginTop: 15,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    user_area: {
        width: "100%",
        paddingLeft: 20,
        flexDirection: "column"
    },
    text_black17blue: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 17,
        color: Global.colorButtonBlue
    },
    main_area: {
        width: "85%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "flex-start"
    },
    main_container: {
        width: "100%"
    },
    postitems: {
        width: '100%',
        paddingLeft: 20,
        flexDirection: 'column',
        alignItems: 'flex-start'
    }
});  