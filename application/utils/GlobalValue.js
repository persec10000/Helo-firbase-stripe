import { StyleSheet, Dimensions } from 'react-native';

const isDev = false; // true:develop, false:production

const { width, height } = Dimensions.get('window');
const screenHeight = width < height ? height : width;   // height on portrait
const screenWidth = width < height ? width : height;    // width on portrait

const AppColors = {
    colorButtonBlue: '#0049C0',
    colorYellow: '#FFFFBE',
    colorPink: '#FFE6e6',
    colorGreen: '#E8F9E7',
    colorDarkGreen: '#C5E2C3',
    colorBlue: '#E6EEFF',
    colorLoginBack: '#e8eff8',
    colorSignupCameraBack: '#d9d7d7',
    colorSoldBack: '#a8a8a8cc',
};

const AppFonts = {
    Eurostile_Black: "eurostile_extended_black",
    Nimbus_Black: "Nimbus-Sans-D-OT-Black-Extended",
    Nimbus_Bold: "Nimbus-Sans-D-OT-Bold-Extended",
    Nimbus_Regular: "Nimbus-Sans-D-OT-Regular-Extended",
};

const stripeClientId = 'ca_Fq7OpkezC3VAqBe6joSLiWZqULov3v6E'; // client test mode

const GlobalValue = {
    TabBarHeight: Math.round(screenWidth * 0.13),
    bottomBottomButtonWithTab: Math.round(screenWidth * 0.13) + 20,
    // StatusBarHeight: (Platform.OS === 'ios') ? 25 : 0,
    HeaderArrowWidth: Math.round(screenWidth * 0.18),
    SearchHomeFeedLimit: 50,
    SearchHotLimit: 6,
    SearchNewLimit: 6,
    SearchLimit: 50,
    SearchPeopleLimit: 30,
    sizeSet: ["NA", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38"],
    ToastDuration: 2500,

    // push notification
    PUSH_ENDPOINT: 'https://exp.host/--/api/v2/push/send',

    // Stripe
    StripePublicKey: "pk_test_Y8sS8bhySesezpwWqFM6zmiG00UWlCHWZY", // client
    stripeConnectWebViewUrl: `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write`,
    stripeRedirectUri: 'https://helomobileapp.com/helo',
    stripeGetAccountIdUrl: 'https://www.theheloapp.com/_functions/stripeGetAccountToken',
    stripeCheckoutUrl: 'https://www.theheloapp.com/_functions/stripeCheckout',
    stripeReleaseToSellerUrl: 'https://www.theheloapp.com/_functions/stripeTransfer',
    stripeRefundToBuyerUrl: 'https://www.theheloapp.com/_functions/stripeRefund',

    // report user send mail
    // sendEmailUrlForReportUser:  'https://wanbojang.wixsite.com/website/_functions-dev/sendEmailForReportUser',
    sendEmailUrlForReportUser: 'https://www.theheloapp.com/_functions/sendEmailForReportUser',

    // textinput maxlength
    TM10: 10, // price
    TM20: 20, // location
    TM30: 30, // name, username, password, major
    TM50: 50, // university
    TM100: 100, // chat
    TM150: 150,
    TM200: 200,
    TM500: 500,
}

const GlobalStyles = StyleSheet.create({
    Header: {
        fontFamily: AppFonts.Nimbus_Black,
        fontSize: 30,
        color: 'black'
    },
    HeaderMedium: {
        fontFamily: AppFonts.Nimbus_Black,
        fontSize: 26,
        color: 'black'
    },
    HeaderSmall: {
        fontFamily: AppFonts.Nimbus_Black,
        fontSize: 22,
        color: 'black'
    },
});

export default {
    isDev,
    screenWidth,
    screenHeight,
    ...AppColors,
    ...AppFonts,
    ...GlobalValue,
    ...GlobalStyles,
};



// user status
//     0: general
//     1: suspend
//     2: deleted
// SearchCategory
//     1:  all,
//     2:  liked,
//     3:  reviews,
//     4:  clothes,
//     5:  tech,
//     6:  home,
//     7:  books,
//     8:  other
// Transaction Usertype: me
//     true:   buyer
//     false:  seller
// OrderTransaction Status: 
//     0:  decline,
//     1:  proposed, - buyer's money charged to app
//     2:  accepted
//     3:  confirmed as success - money released to seller
//     4:  order canceled - refund
//     6:  seller's status for soldpage when buyer click checkout confirm
// OrderChatType:
//     0:  declined,
//     1:  proposed,
//     2:  new pickup proposed,
//     3:  accepted,
//     4:  general chat
// Notification:
//     1:  like, - type(1), uid, info (picture)
//     2:  comment, - type(2), uid, info (picture, comment)
//     3:  follow - type(3), uid, info (picture-avatar)