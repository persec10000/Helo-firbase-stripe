import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Toast } from 'native-base';
import Strings from '@utils/Strings';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import getPermission from '@utils/getPermission';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import AppHeaderArrow from '@components/AppHeaderArrow';

const avatarWidth = Math.round(Global.screenWidth * 0.24)

export default class ProfileSetting extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            showGenderContent: false,
            doneprocessing: false,
            oldInfo: {
                avatar: '',
                username: '',
                name: '',
                major: '',
                gender: 0,
            },
            inputInfo: {
                avatar: '',
                username: '',
                name: '',
                major: '',
                gender: 0,
            },
            changed: false,
        };

    }
    componentDidMount() {
        Fire.shared.getUserProfile().then((res) => {
            const tempObj = {
                avatar: res.avatar || '',
                username: res.username || '',
                name: res.name || '',
                major: res.major || '',
                gender: res.gender || 0
            }
            this.setState({
                oldInfo: tempObj,
                inputInfo: tempObj,
            })
        }).catch((err) => Global.isDev && console.log(err))
    }

    pressAvatar() {
        this.selectPhoto();
    }

    selectPhoto = async () => {
        const options = {
            allowsEditing: true,
            aspect: [3, 3],
        };
        const status = await getPermission(Permissions.CAMERA_ROLL);
        if (status) {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.cancelled) {
                this.setState({
                    inputInfo: {
                        ...this.state.inputInfo,
                        avatar: result.uri,
                    },
                    changed: true,
                })
            }
        }
    };

    pressGender(number) {
        if (number === 0) {
            this.setState({ showGenderContent: !this.state.showGenderContent })
        } else {
            this.setState({ showGenderContent: false, changed: true, inputInfo: { ...this.state.inputInfo, gender: number } })
        }
    }

    async done() {
        if (!this.state.changed) {
            return;
        }

        let { avatar, username, name, major, gender } = this.state.inputInfo;
        username = username.trim().toLowerCase();
        name = name.trim().toLowerCase();
        major = major.trim().toLowerCase();
        if (name === '' || username === '') {
            Toast.show({ text: Strings.ST38, position: 'bottom', duration: Global.ToastDuration })
            return;
        }

        this.setState({
            doneprocessing: true
        })
        // username duplicate check
        if (username !== this.state.oldInfo.username) {
            const isDuplicate = await Fire.shared.checkUsernameDuplicate(username);
            if (isDuplicate) {
                Toast.show({ text: Strings.ST17, position: 'bottom', duration: Global.ToastDuration })
                this.setState({ doneprocessing: false });
                return;
            }
        }
        // trim info
        const updateInfo = {
            avatar: avatar,
            username: username,
            name: name,
            major: major,
            gender: gender,
        }

        Fire.shared.updateProfile(this.state.oldInfo, updateInfo).then(() => {
            this.setState({
                doneprocessing: false,
                changed: false,
                oldInfo: updateInfo,
            })
            Toast.show({ text: Strings.ST39, position: 'bottom', duration: Global.ToastDuration })
        }).catch((err) => {
            Global.isDev && console.log(err);
            Toast.show({ text: Strings.ST02, position: 'bottom', duration: Global.ToastDuration })
            this.setState({
                doneprocessing: false,
                changed: false,
            })
        })
    }

    render() {
        const avatar = this.state.inputInfo.avatar ? { uri: this.state.inputInfo.avatar } : require('@images/avatar.png');

        const genderTitle = this.state.inputInfo.gender === 0 ? 'change gender  ' : (this.state.inputInfo.gender === 1 ? 'male   ' : (this.state.inputInfo.gender === 2 ? 'female  ' : 'prefer not to say  '));

        return (
            <KeyboardAwareScrollView contentContainerStyle={styles.container} scrollEnabled={false} >

                <AppHeaderArrow title={'profile settings'} pressArrow={() => this.props.navigation.goBack()} />

                <View style={styles.main_container}>

                    <View style={styles.f_row}>
                        {/* avatar */}
                        <View style={styles.avatar_container}>
                            <TouchableOpacity onPress={this.pressAvatar.bind(this)} style={styles.avatar_wrapper}>
                                <Image source={avatar} style={styles.avatar} resizeMode='contain' />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatar_rightspace}></View>

                        <View style={styles.changetext_wrapper}>
                            <Text style={styles.text_black15}>change</Text>
                            <Text style={styles.text_black15}>profile picture</Text>
                        </View>
                    </View>


                    {/* change items */}
                    <View style={styles.username_wrapper}>
                        <TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.item_input} placeholder="change username" placeholderTextColor='black' onChangeText={text => this.setState({ inputInfo: { ...this.state.inputInfo, username: text }, changed: true })} value={this.state.inputInfo.username}
                        />
                    </View>


                    <View style={styles.name_wrapper}>
                        <TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.item_input} placeholder="change name" placeholderTextColor='black' onChangeText={text => this.setState({ inputInfo: { ...this.state.inputInfo, name: text }, changed: true })} value={this.state.inputInfo.name}
                        />
                    </View>

                    <View style={styles.name_wrapper}>
                        <TextInput maxLength={Global.TM30} autoCapitalize='none' multiline={false} style={styles.item_input} placeholder="change major" placeholderTextColor='black' onChangeText={text => this.setState({ inputInfo: { ...this.state.inputInfo, major: text }, changed: true })} value={this.state.inputInfo.major}
                        />
                    </View>


                    {/* gender */}
                    <View style={styles.gender_wrapper}>

                        <TouchableOpacity style={styles.gender_titlewrapper} onPress={this.pressGender.bind(this, 0)}>
                            <Text style={styles.text_black16}>{genderTitle}</Text>
                            <Ionicons name="md-arrow-dropdown" size={20} color={'black'} />
                        </TouchableOpacity>

                        {this.state.showGenderContent &&
                            <TouchableOpacity style={styles.genderitems} onPress={this.pressGender.bind(this, 1)}>
                                <Text style={styles.text_regular20}>male</Text>
                            </TouchableOpacity>
                        }

                        {this.state.showGenderContent &&
                            <TouchableOpacity style={styles.genderitems} onPress={this.pressGender.bind(this, 2)}>
                                <Text style={styles.text_regular20}>female</Text>
                            </TouchableOpacity>
                        }

                        {this.state.showGenderContent &&
                            <TouchableOpacity style={styles.genderitems} onPress={this.pressGender.bind(this, 3)}>
                                <Text style={styles.text_regular20}>prefer not to say</Text>
                            </TouchableOpacity>
                        }
                    </View>



                    {/* done */}
                    {!this.state.doneprocessing &&
                        <TouchableOpacity style={styles.done_wrapper} onPress={this.done.bind(this)}>
                            <Text style={styles.done_text}>done</Text>
                        </TouchableOpacity>
                    }
                    {this.state.doneprocessing &&
                        <View style={styles.done_wrapper}>
                            <ActivityIndicator size="large" />
                        </View>
                    }

                </View>

            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    item_input: {
        width: "100%",
        fontFamily: Global.Nimbus_Black,
        fontSize: 16,
        fontWeight: "normal",
        paddingTop: 25
    },
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
        paddingTop: "2%"
    },
    avatar_container: {
        flex: 0.3
    },
    avatar_wrapper: {
        justifyContent: "center",
        alignItems: "center",
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: Math.round(avatarWidth / 2),
        backgroundColor: Global.colorSignupCameraBack,
        overflow: "hidden"
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: Math.round(avatarWidth / 2)
    },
    avatar_rightspace: {
        flex: 0.05
    },
    changetext_wrapper: {
        flex: 0.55,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start"
    },
    text_black15: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 15
    },
    text_black16: {
        fontFamily: Global.Nimbus_Black,
        fontSize: 16
    },
    username_wrapper: {
        marginTop: 10,
        width: "100%",
        justifyContent: "flex-end",
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    name_wrapper: {
        width: "100%",
        justifyContent: "flex-end",
        borderBottomColor: "black",
        borderBottomWidth: 1
    },
    gender_wrapper: {
        paddingTop: 25,
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start"
    },
    gender_titlewrapper: {
        flexDirection: "row",
        alignItems: 'center'
    },
    genderitems: {
        marginLeft: 50,
        marginTop: 5,
    },
    text_regular20: {
        color: "black",
        fontFamily: Global.Nimbus_Regular,
        fontSize: 20
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
    },
    f_row: {
        flexDirection: 'row'
    }
});
