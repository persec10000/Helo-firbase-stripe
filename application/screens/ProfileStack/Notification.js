
import React, { Component } from 'react';
import { TouchableOpacity, View, Image, ScrollView, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { AntDesign } from '@expo/vector-icons';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import AppHeaderArrow from '@components/AppHeaderArrow';

const itemHeight = Math.round(Global.screenWidth * 0.3);
const imageWidth = Math.round(itemHeight * 0.7);

export default class Notification extends Component { //'NotificationScreen'
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataArray: [],
        };
    }
    componentDidMount() {
        Fire.shared.getMyNotification().then((res) => { //object
            if (!res) {
                this.setState({
                    loading: false
                })
                return;
            }

            let tempArray = Object.keys(res).map(timestamp => {
                return { ...res[timestamp], time: timestamp }
            })
            tempArray.sort(function (x, y) {
                return y.time - x.time;
            })

            this.setState({
                dataArray: tempArray,
                loading: false,
            })
        }).catch((error) => Global.isDev && console.log(error));
    }
    pressUser(uid) {
        const navigateAction = NavigationActions.navigate({
            routeName: 'OtherProfileScreen',
            params: {
                from: 'NotificationScreen',
                uid: uid,
            }
        });
        this.props.navigation.dispatch(navigateAction);
    }
    renderFlatListItem(item) {
        let besidetext = '';
        let belowtext = '';
        let isAvatar = false;
        if (item.type === 1) { // like

        } else if (item.type === 2) { // comment
            besidetext = 'commented:';
            belowtext = item.comment;
        } else if (item.type === 3) { // follow
            besidetext = 'followed you';
            isAvatar = true;
        }
        return (

            <View style={styles.item_wrapper}>

                <View style={styles.item_subwrapper}>

                    <TouchableOpacity disabled={!isAvatar} onPress={this.pressUser.bind(this, item.uid)} style={[styles.item_imagewrapper, { borderRadius: item.type === 3 ? Math.round(imageWidth / 2) : 0 }]}>
                        <Image
                            source={{ uri: item.picture }}
                            style={styles.item_image}
                            resizeMode='contain' />
                    </TouchableOpacity>

                    <View style={{ marginLeft: 15 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {item.type === 1 && <AntDesign name="heart" size={15} color={'black'} />}
                            {item.type === 1 && <Text> </Text>}
                            <TouchableOpacity onPress={this.pressUser.bind(this, item.uid)}>
                                <Text style={styles.text_bold13}>@{item.username} </Text>
                            </TouchableOpacity>
                            <Text style={styles.text_regular13}>{besidetext}</Text>
                        </View>
                        <Text style={styles.text_regular12}>{belowtext}</Text>
                    </View>
                </View>
            </View>
        )
    }

    render() {

        return (

            <View style={styles.container}>

                <AppHeaderArrow title={'notifications'} pressArrow={() => this.props.navigation.goBack()} />

                <ScrollView style={styles.main_container}>

                    {this.state.loading &&
                        <View style={styles.indicator_wrapper}>
                            <ActivityIndicator style={{ height: 80 }} size="large" color="#f39c12" />
                        </View>
                    }
                    {!this.state.loading &&
                        <FlatList
                            data={this.state.dataArray}
                            extraData={this.state}
                            renderItem={({ item }) => this.renderFlatListItem(item)}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    }

                </ScrollView>

                <View style={{ height: Global.TabBarHeight }}></View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    item_wrapper: {
        width: "100%",
        height: itemHeight,
        borderBottomColor: "black",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    item_subwrapper: {
        width: "85%",
        height: "70%",
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    item_imagewrapper: {
        width: imageWidth,
        height: imageWidth,
        overflow: "hidden"
    },
    item_image: {
        width: imageWidth,
        height: imageWidth
    },
    text_bold13: {
        fontFamily: Global.Nimbus_Bold,
        fontSize: 13
    },
    text_regular13: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 13
    },
    text_regular12: {
        fontFamily: Global.Nimbus_Regular,
        fontSize: 12
    },
    container: {
        flex: 1,
        backgroundColor: Global.colorGreen,
        alignItems: "center"
    },
    main_container: {
        flex: 1,
        width: "100%",
        height: "100%",
        flexDirection: "column"
    },
    indicator_wrapper: {
        width: "100%",
        height: 100,
        justifyContent: "center",
        alignItems: "center"
    }
});