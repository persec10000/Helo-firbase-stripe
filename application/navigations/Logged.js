
import React, { Component } from 'react';
import { createAppContainer, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, Image } from "react-native";
import Global from '@utils/GlobalValue';

import HomeScreen from '@screens/HomeStack/HomeScreen';
import FeedItemScreen from '@screens/HomeStack/FeedItemScreen';
import CheckoutScreen from '@screens/HomeStack/Checkout';
import ActiveOrdersScreen from '@screens/HomeStack/ActiveOrders';
import BoughtAndSold from '@screens/HomeStack/BoughtAndSold';
import PickupAndDropoffConfirm from "@screens/HomeStack/PickupAndDropoffConfirm";
import PickupAndDropoffSuccess from "@screens/HomeStack/PickupAndDropoffSuccess";
import PickupAndDropoffIssue from "@screens/HomeStack/PickupAndDropoffIssue";
import OrderCancelScreen from "@screens/HomeStack/OrderCancel";

import SearchScreen from '@screens/SearchStack/Search';

import SellScreen from '@screens/SellStack/Sell';

import InboxScreen from '@screens/InboxStack/Inbox';
import OrderChatScreen from '@screens/InboxStack/OrderChat';
import FriendChatScreen from '@screens/InboxStack/FriendChat'
import ReportUserScreen from "@screens/InboxStack/ReportUser";

import MyProfileScreen from "@screens/ProfileStack/MyProfile";
import OtherProfileScreen from '@screens/ProfileStack/OtherPersonProfile';
import FollowViewScreen from "@screens/ProfileStack/FollowView";
import NotificationScreen from '@screens/ProfileStack/Notification';
import MyAccountScreen from '@screens/ProfileStack/MyAccount';
import MyPurchasesAndSales from '@screens/ProfileStack/MyPurchasesAndSales';
import SettingScreen from '@screens/ProfileStack/Settings';
import AccountSettingScreen from '@screens/ProfileStack/AccountSetting';
import ProfileSettingScreen from '@screens/ProfileStack/ProfileSetting';
import VacationModeScreen from '@screens/ProfileStack/VacationMode';
import RulesScreen from '@screens/ProfileStack/Rules';
import FaqsScreen from '@screens/ProfileStack/Faqs';
import ContactUsScreen from '@screens/ProfileStack/ContactUs';
import LogoutScreen from "@screens/ProfileStack/Logout";
import AdminPage from '@screens/ProfileStack/AdminPage';
import AdminReportUser from '@screens/ProfileStack/AdminReportUser';
import AdminEngagement from '@screens/ProfileStack/AdminEngagement';
import AdminPostsNumber from '@screens/ProfileStack/AdminPostsNumber';
import AdminSoldItems from '@screens/ProfileStack/AdminSoldItems';
import AdminSoldNumber from '@screens/ProfileStack/AdminSoldNumber';
import AdminIncome from '@screens/ProfileStack/AdminIncome';

const imageHome = require('@images/home.png');
const imageSearch = require('@images/magnifying-glass.png');
const imageSell = require('@images/camera.png');
const imageInbox = require('@images/mail.png');
const imageProfile = require('@images/user.png');


const TabHome = createStackNavigator(
    {
        HomeScreen: {
            screen: HomeScreen,
        },
        FeedItemScreen: {
            screen: FeedItemScreen,
        },
        SellScreen: {
            screen: SellScreen,
        },
        ActiveOrdersScreen: {
            screen: ActiveOrdersScreen,
        },
        CheckoutScreen: {
            screen: CheckoutScreen,
        },
        BoughtAndSold: {
            screen: BoughtAndSold
        },
        OrderCancelScreen: {
            screen: OrderCancelScreen
        },
        PickupAndDropoffConfirm: {
            screen: PickupAndDropoffConfirm
        },
        PickupAndDropoffSuccess: {
            screen: PickupAndDropoffSuccess
        },
        PickupAndDropoffIssue: {
            screen: PickupAndDropoffIssue
        },
    }, {
    initialRouteName: "HomeScreen",
});

const TabSearch = createStackNavigator(
    {
        SearchScreen: {
            screen: SearchScreen,
        }
    }, {
    initialRouteName: "SearchScreen",
});

const TabSell = createStackNavigator(
    {
        SellScreen: {
            screen: SellScreen,
        },
    }, {
    initialRouteName: "SellScreen",
});

const TabInbox = createStackNavigator(
    {
        InboxScreen: {
            screen: InboxScreen,
        },
        OrderChatScreen: {
            screen: OrderChatScreen,
        },
        FriendChatScreen: {
            screen: FriendChatScreen
        },
        ReportUserScreen: {
            screen: ReportUserScreen
        },
    }, {
    initialRouteName: "InboxScreen",
});

const TabProfile = createStackNavigator(
    {
        MyProfileScreen: {
            screen: MyProfileScreen,
        },
        OtherProfileScreen: {
            screen: OtherProfileScreen,
        },
        FollowViewScreen: {
            screen: FollowViewScreen
        },
        NotificationScreen: {
            screen: NotificationScreen
        },
        MyAccountScreen: {
            screen: MyAccountScreen
        },
        MyPurchasesAndSales: {
            screen: MyPurchasesAndSales
        },
        SettingScreen: {
            screen: SettingScreen
        },
        AccountSettingScreen: {
            screen: AccountSettingScreen
        },
        ProfileSettingScreen: {
            screen: ProfileSettingScreen
        },
        VacationModeScreen: {
            screen: VacationModeScreen
        },
        RulesScreen: {
            screen: RulesScreen
        },
        FaqsScreen: {
            screen: FaqsScreen
        },
        ContactUsScreen: {
            screen: ContactUsScreen
        },
        LogoutScreen: {
            screen: LogoutScreen
        },
        AdminPage: {
            screen: AdminPage
        },
        AdminReportUser: {
            screen: AdminReportUser
        },
        AdminEngagement: {
            screen: AdminEngagement
        },
        AdminPostsNumber: {
            screen: AdminPostsNumber
        },
        AdminSoldItems: {
            screen: AdminSoldItems,
        },
        AdminSoldNumber: {
            screen: AdminSoldNumber
        },
        AdminIncome: {
            screen: AdminIncome
        }
    }, {
    initialRouteName: "MyProfileScreen",
});

class TabBarBottom extends Component {
    render() {
        const {
            renderIcon,
            activeTintColor,
            inactiveTintColor,
            onTabPress,
            onTabLongPress,
            getAccessibilityLabel,
            navigation
        } = this.props;
        const { routes, index: activeRouteIndex } = navigation.state;

        return (
            <View style={{ width: '100%', height: Global.TabBarHeight, flexDirection: 'row' }}>

                {routes.map((route, routeIndex) => {
                    const isRouteActive = routeIndex === activeRouteIndex;
                    // const tintColor = isRouteActive ? activeTintColor : inactiveTintColor;

                    let iconimage;
                    let imagePercent = '';
                    let routeName = '';
                    if (routeIndex === 0) {
                        iconimage = imageHome
                        imagePercent = '50%'
                        routeName = 'HomeScreen'
                    } else if (routeIndex === 1) {
                        iconimage = imageSearch
                        imagePercent = '50%'
                        routeName = 'SearchScreen'
                    } else if (routeIndex === 2) {
                        iconimage = imageSell
                        imagePercent = '60%'
                        routeName = 'SellScreen'
                    } else if (routeIndex === 3) {
                        iconimage = imageInbox
                        imagePercent = '60%'
                        routeName = 'InboxScreen'
                    } else if (routeIndex === 4) {
                        iconimage = imageProfile
                        imagePercent = '45%'
                        routeName = 'MyProfileScreen'
                    }

                    return (

                        <TouchableOpacity
                            key={routeIndex}
                            style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                // onTabPress({ route });
                                const navigateAction = NavigationActions.navigate({
                                    routeName: routeName,
                                });
                                navigation.dispatch(navigateAction);
                            }}
                            onLongPress={() => {
                                // onTabLongPress({ route });
                                const navigateAction = NavigationActions.navigate({
                                    routeName: routeName,
                                });
                                navigation.dispatch(navigateAction);
                            }}
                            accessibilityLabel={getAccessibilityLabel({ route })}
                        >
                            <Image
                                source={iconimage}
                                style={{ width: Global.TabBarHeight, height: imagePercent }}
                                resizeMode='contain' />
                            <View style={{ width: '50%', position: 'absolute', bottom: 10, height: 1, backgroundColor: isRouteActive ? 'black' : 'transparent' }}></View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}


const BottomTabs = createBottomTabNavigator(
    {
        Home: { screen: TabHome },
        Search: { screen: TabSearch },
        Sell: { screen: TabSell },
        Inbox: { screen: TabInbox },
        Profile: { screen: TabProfile }
    },
    {
        tabBarOptions: {
            style: {
                height: Global.TabBarHeight,
                borderTopWidth: 0,
            },
        },
        initialRouteName: 'Home',
        animationEnabled: true,
        tabBarPosition: 'bottom',
        tabBarComponent: props => {
            return (
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                    <TabBarBottom {...props} />
                </View>
            )
        },
    }
);

const MainContainer = createAppContainer(BottomTabs);

export default MainContainer;