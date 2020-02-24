
import * as firebase from 'firebase';
require('firebase/firestore');
import uploadPhoto from './uploadPhoto';
import shrinkImageAsync from './shrinkImageAsync';
import Global from './GlobalValue';
import isEmpty from '@utils/isEmpty';
import * as Permissions from 'expo-permissions';
// import { Notifications } from 'expo';
import Constants from 'expo-constants';

const firebaseConfig = {
    apiKey: "AIzaSyAMF7KfdT9FY946W-262CJrQapKZD4PLKM",
    authDomain: "helo-mobile.firebaseapp.com",
    databaseURL: "https://helo-mobile.firebaseio.com",
    projectId: "helo-mobile",
    storageBucket: "helo-mobile.appspot.com",
    messagingSenderId: "348257092049",
    appId: "1:348257092049:web:0b26cfa2b97e57efeb60f0",
};

function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        // if (unit == "K") { dist = dist * 1.609344 }
        // if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}


class Fire {
    uid = '';
    email = '';
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.uploadPhotoAsync = this.uploadPhotoAsync.bind(this);
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.uid = user.uid;
                this.email = user.email;
            }
        });
        this.uploadStorePictures = this.uploadStorePictures.bind(this);
    }


    uploadPhotoAsync = async (mediaLocalUrl, storagefilename) => {
        const { uri: reducedImage, width, height } = await shrinkImageAsync(mediaLocalUrl);
        const path = `avatar/${storagefilename}.png`;
        const photopath = await uploadPhoto(reducedImage, path);
        return photopath;
    };


    setMyLocation(lat, long) {
        const db = firebase.firestore();
        db.collection("location").doc(`${this.uid}`).set({
            lat: lat,
            long: long
        }).then(function () {
            // Global.isDev && console.log('set location success');
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    setSignup = async (userObj) => {
        const currentTimeStamp = new Date().getTime();

        // let photopath = '';
        // if (userObj.avatar) {
        //     photopath = await this.uploadPhotoAsync(userObj.avatar, userObj.uid);
        // }

        // push notification token
        let pushtoken = '';
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(
                Permissions.NOTIFICATIONS
            );
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus === 'granted') {
                // pushtoken = await Notifications.getExpoPushTokenAsync();
            }
        }

        this.changeAppGenderStatus(0, userObj.gender);

        const db = firebase.firestore();
        return db.collection("users").doc(`${userObj.uid}`).set({
            // avatar: photopath,
            name: userObj.name,
            username: userObj.username,
            university: userObj.university,
            major: userObj.major,
            gender: userObj.gender,
            pushtk: pushtoken,
            regtime: currentTimeStamp,
        }).then(() => {
            const username = userObj.username;
            const email = userObj.email;
            return db.collection("email").doc(`${username}`).set({
                mail: email
            })
        }).catch(function (error) {
            console.error("Error writing document: ", error);
            return;
        });
    }


    updateProfile = async (oldInfo, updateInfo) => {
        const myuid = this.uid;

        let profileInfo = {};
        if (oldInfo.avatar !== updateInfo.avatar) {
            const photopath = await this.uploadPhotoAsync(updateInfo.avatar, myuid);
            profileInfo['avatar'] = photopath;
        }
        if (oldInfo.username !== updateInfo.username) {
            this.changeUsernameForEmail(oldInfo.username, updateInfo.username);
            profileInfo['username'] = updateInfo.username;
        }
        if (oldInfo.name !== updateInfo.name) {
            profileInfo['name'] = updateInfo.name;
        }
        if (oldInfo.major !== updateInfo.major) {
            profileInfo['major'] = updateInfo.major;
        }
        if (oldInfo.gender !== updateInfo.gender) {
            profileInfo['gender'] = updateInfo.gender;
            this.changeAppGenderStatus(oldInfo.gender, updateInfo.gender)
        }

        const db = firebase.firestore();
        const docRef = db.collection("users").doc(`${myuid}`);
        return docRef.update({
            ...profileInfo
        }).then(() => {
            return true;
        }).catch(function (error) {
            console.error("Error writing document: ", error);
            return false;
        });
    }


    changeAppGenderStatus(oldgender, newgender) {
        const db = firebase.firestore();
        const appDocRef = db.collection("app").doc("statistics");
        appDocRef.get().then((result) => {
            const docData = result.data();
            let men = docData.men || 0;
            let women = docData.women || 0;
            let notsay = docData.notsay || 0;
            men += (newgender === 1) ? 1 : 0;
            women += (newgender === 2) ? 1 : 0;
            notsay += (newgender === 3) ? 1 : 0;
            men -= (oldgender === 1) ? 1 : 0;
            women -= (oldgender === 2) ? 1 : 0;
            notsay -= (oldgender === 3) ? 1 : 0;

            appDocRef.update({
                men: men,
                women: women,
                notsay: notsay
            })
        }).catch((error) => {
            Global.isDev && console.log(error);
        })
    }


    setLastLogin() {
        const db = firebase.firestore();
        const docRef = db.collection("users").doc(`${this.uid}`);
        const now = new Date();
        const currentTimeStamp = now.getTime();
        docRef.get().then((doc) => {
            if (doc.exists) {
                docRef.update({
                    lastlogin: currentTimeStamp
                }).catch(function (error) {
                    console.error("Error writing document: ", error);
                });
            }
        })
    }


    getUserProfile(userid) {
        const uid = (userid === undefined) ? this.uid : userid;
        const db = firebase.firestore();
        let docRef = db.collection("users").doc(`${uid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                return doc.data();
            } else {
                Global.isDev && console.log("No such document!");
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    getUserName(userid) {
        const uid = (userid === undefined) ? this.uid : userid;
        const db = firebase.firestore();
        let docRef = db.collection("users").doc(`${uid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                return doc.data().username;
            } else {
                return '';
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    getUserNames(uidarray) {
        const db = firebase.firestore();
        let refs = [];
        try {
            refs = uidarray.map(uid => {
                if (uid !== '') return db.collection("users").doc(`${uid}`).get()
            })
            return Promise.all([...refs]).then(result => {
                let returnObj = {};
                for (let i = 0; i < result.length; i++) {
                    oneusersnapshot = result[i];
                    if (oneusersnapshot.exists) {
                        returnObj[oneusersnapshot.id] = oneusersnapshot.data().username;
                    } else {
                        returnObj[oneusersnapshot.id] = '';
                    }

                }
                return returnObj;
            })
        } catch (error) {
        }
        return null
    }


    getUserNamesAndAvatars(uidarray) {
        const db = firebase.firestore();
        let refs = [];
        try {
            refs = uidarray.map(uid => {
                if (uid !== '') return db.collection("users").doc(`${uid}`).get()
            })

            return Promise.all([...refs]).then(result => {
                let returnObj = {};
                for (let i = 0; i < result.length; i++) {
                    if (result[i].exists) {
                        userid = result[i].id;
                        userprofile = result[i].data();
                        returnObj[userid] = {
                            username: userprofile.username,
                            avatar: userprofile.avatar,
                        }
                    }
                }
                return returnObj;
            })
        } catch (error) {
            Global.isDev && console.log('getusernames error');
        }
        return null
    }


    uploadStorePictures = async (arraypicture, postid) => {
        let storagepicturepaths = [];
        for (let i = 0; i < arraypicture.length; i++) {
            const element = arraypicture[i];
            const { uri: reducedImage, width, height } = await shrinkImageAsync(element);
            const photopath = await uploadPhoto(reducedImage, `store/${postid}_${i}.png`);
            storagepicturepaths.push(photopath);
        }

        const db = firebase.firestore();
        return db.collection('store').doc(`${postid}`).update({
            picture: storagepicturepaths
        }).then(function () {
            return;
        }).catch(function (error) {
            console.error("Error updating document: ", error);
        });
    };


    postToStore(postObj, postid, picturechanged) {

        const myuid = this.uid;
        const db = firebase.firestore();
        let tempObj = postObj;
        tempObj['uid'] = myuid;

        const currentTimeStamp = new Date().getTime();
        let picture = [];
        picture = tempObj.picture;
        if (postid) { // edit post
            if (picturechanged) {
                tempObj['picture'] = [];
            }
            return db.collection("store").doc(`${postid}`).set({
                ...tempObj, time: currentTimeStamp,
            }).then(() => {
                if (picturechanged) {
                    return this.uploadStorePictures(picture, postid).then(() => {
                        return true;
                    })
                }
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });
        } else { // new post
            tempObj['picture'] = [];
            return db.collection("store").add({
                ...tempObj, time: currentTimeStamp,
            }).then((docRef) => {
                const postid = docRef.id;
                return this.uploadStorePictures(picture, postid).then(() => {
                    return true;
                })
            }).catch(function (error) {
                console.error("Error adding document: ", error);
            });
        }
    }


    getSearchData(searchText, category, searchRadius, limitCampus, gender) {

        const db = firebase.firestore();
        const mylocationRef = db.collection("location").doc(`${this.uid}`);
        const myProfileRef = db.collection("users").doc(`${this.uid}`);
        const wholeLocationRef = db.collection("location");
        let myuniversity = '';
        let mylat = 0, mylong = 0;

        return mylocationRef.get().then((res) => {
            if (!res.exists) {
                return null;
            }
            mylat = res.data().lat;
            mylong = res.data().long;
        }).then(() => {
            if (mylat === 0) return null;
            let uidarrayForRadius = [];
            return wholeLocationRef.get().then((querySnapshot) => {
                querySnapshot.forEach(function (locationdoc) {
                    const distanceFromMe = distance(mylat, mylong, locationdoc.data().lat, locationdoc.data().long)
                    if (distanceFromMe < searchRadius) {
                        uidarrayForRadius.push(locationdoc.id);
                    }
                });
                return uidarrayForRadius;
            })
        }).then((uidarrayForRadius) => {
            if (mylat === 0) return null;
            if (limitCampus) {
                return myProfileRef.get().then((myprofile) => {
                    if (!myprofile.exists) {
                        return null;
                    }
                    myuniversity = myprofile.data().university;
                }).then(() => {
                    let uidarray = [];
                    return db.collection("users").where("university", "==", myuniversity).get().then((campusresult) => {
                        campusresult.forEach(function (campusresultdoc) {
                            const oneuid = campusresultdoc.id;
                            if (uidarrayForRadius.includes(oneuid)) {
                                uidarray.push(oneuid)
                            }
                        })
                        return uidarray
                    })
                })
            } else {
                return uidarrayForRadius;
            }
        }).then(async (uidarraylist) => {
            if (mylat === 0) return null;
            if (category === 6) { // person search
                if (uidarraylist.includes(this.uid)) { // remove myuid
                    for (var i = 0; i < uidarraylist.length; i++) {
                        if (uidarraylist[i] === this.uid) {
                            uidarraylist.splice(i, 1);
                        }
                    }
                }
                if (uidarraylist.length === 0) return null;
                const newUserSearchDocRef = db.collection("users").orderBy("regtime", "desc").limit(Global.SearchPeopleLimit);
                return newUserSearchDocRef.get().then((querySnapshot) => {
                    let personArray = [];
                    querySnapshot.forEach(function (snapshotdoc) {
                        const oneUserUid = snapshotdoc.id;
                        if (uidarraylist.includes(oneUserUid)) {
                            const oneUser = snapshotdoc.data();
                            if (searchText === '') {
                                personArray.push({
                                    uid: oneUserUid,
                                    avatar: oneUser.avatar,
                                    username: oneUser.username,
                                    name: oneUser.name,
                                })
                            } else {
                                if (oneUser.username.indexOf(searchText) != -1) {
                                    personArray.push({
                                        uid: oneUserUid,
                                        avatar: oneUser.avatar,
                                        username: oneUser.username,
                                        name: oneUser.name,
                                    })
                                }
                            }
                        }
                    })
                    return personArray;
                }).catch(() => {
                    return null;
                })
            } else {
                const now = new Date();
                const oneDayAgoTimeStamp = now.getTime() - (1 * 24 * 3600 * 1000); // one day
                let docRef;
                if (category === 1) {
                    docRef = db.collection("store").where("category", "==", category).where("gender", "==", gender).orderBy("time", "desc").limit(Global.SearchLimit)
                } else {
                    docRef = db.collection("store").where("category", "==", category).orderBy("time", "desc").limit(Global.SearchLimit)
                }
                return docRef.get().then((querySnapshot) => {
                    let hotArray = [], newArray = [];
                    querySnapshot.forEach(function (snapshotdoc) {
                        const onePost = snapshotdoc.data();
                        const onepostuid = onePost.uid;
                        const oneposttitle = onePost.title;
                        const onepostbrand = onePost.brand;
                        if (uidarraylist.includes(onepostuid)) {
                            if (oneposttitle.includes(searchText) || onepostbrand.includes(searchText)) {
                                if (onePost.time > oneDayAgoTimeStamp) {
                                    const likecount = onePost.like ? onePost.like.length : 0;
                                    if (likecount !== 0) {
                                        onePost['likecount'] = likecount;
                                        hotArray.push(onePost);
                                    };
                                }
                                if (newArray.length < 6) {
                                    newArray.push(onePost);
                                }
                            }
                        }
                    });
                    hotArray.sort(function (x, y) {
                        return y.likecount - x.likecount;
                    });
                    return {
                        hot: hotArray,
                        new: newArray,
                    };
                }).catch(() => {
                    return null;
                })
            }
        }).catch((error) => {
            Global.isDev && console.log(error);
            return null;
        });
    }


    getFeedOfMyFollow(lastDoc) {
        const db = firebase.firestore();
        const myuid = this.uid;
        let lastVisible = lastDoc;

        return db.collection("users").doc(`${myuid}`).get().then(function (myuserdoc) {
            const myFollowingList = myuserdoc.data().following || [];
            let docRef;
            if (isEmpty(lastVisible)) {
                docRef = db.collection("store").orderBy("time", "desc").limit(Global.SearchHomeFeedLimit);
            } else {
                docRef = db.collection("store").orderBy("time", "desc").startAfter(lastVisible).limit(Global.SearchHomeFeedLimit);
            }

            return docRef.get().then((querySnapshot) => {
                let newArray = [];
                if (querySnapshot.docs.length === 0) {
                    return { newArray, lastVisible };
                }
                let twotemparry = [];
                let pushAttwo = true;
                lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

                querySnapshot.forEach((doc) => {
                    const postuid = doc.data().uid;
                    // if (myFollowingList.includes(postuid)) {
                    const postid = doc.id;
                    let tempObj = {
                        ...doc.data(),
                        postid: postid
                    }
                    if (pushAttwo) {
                        twotemparry.push(tempObj);
                        pushAttwo = false;
                    } else {
                        twotemparry.push(tempObj);
                        newArray.push(twotemparry);
                        twotemparry = [];
                        pushAttwo = true;
                    }
                    // }
                });
                if (twotemparry.length > 0) {
                    newArray.push(twotemparry);
                }
                return { newArray, lastVisible };
            }).catch(function (error) {
                // Global.isDev && console.log("Error getting documents: ", error);
            });
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });

    }


    deletePost(postid) {
        const db = firebase.firestore();
        return db.collection("store").doc(postid).delete().then(function () {
            return;
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    }


    sendComment(mycomment, postid) {
        const myuid = this.uid;
        const db = firebase.firestore();
        const currentTimeStamp = new Date().getTime();
        let mycommentObj = {};
        mycommentObj[currentTimeStamp] = {
            uid: myuid,
            text: mycomment,
        }
        const docRef = db.collection("store").doc(`${postid}`);
        return db.runTransaction(function (transaction) {
            return transaction.get(docRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                const currentComment = sfDoc.data().comment || {};
                const newComment = {
                    ...currentComment,
                    ...mycommentObj,
                }
                transaction.update(docRef, { comment: newComment });
                return;
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    setMyLike(postid, likelist) {
        const db = firebase.firestore();
        return db.collection("store").doc(postid).update({
            like: likelist
        }).then(function () {

        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    checkoutConfirm(checkoutObjs, pickupinfo, chargeId, totalPrice, everbuy) {
        const myuid = this.uid;
        const selleruid = checkoutObjs[0].selleruid;
        const transactionId = new Date().getTime();
        const db = firebase.firestore();
        let pictures = [];
        let postids = [];
        for (let i = 0; i < checkoutObjs.length; i++) {
            const element = checkoutObjs[i];
            pictures.push(element.picture);
            postids.push(element.postid);
        }

        // orders push
        let orderPushObjMe = {};
        let orderPushObjOther = {};
        orderPushObjMe[transactionId] = {
            other: selleruid,
            me: true,
            status: 1,
        }
        orderPushObjOther[transactionId] = {
            other: myuid,
            me: false,
            status: 6,
        }
        const orderPushRefMe = db.collection("orders").doc(`${myuid}`);
        const orderPushRefOther = db.collection("orders").doc(`${selleruid}`);

        // inbox push
        const myUserDocRef = db.collection("users").doc(`${myuid}`);
        return myUserDocRef.update({
            svtime: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            return myUserDocRef.get().then((doc) => {
                return doc.data().svtime.seconds;
            })
        }).then((serverTimestampSecond) => {
            // set everbuy
            db.collection("users").doc(`${myuid}`).update({
                everbuy: true,
            }).catch((error) => Global.isDev && console.log(error));

            const currentServerTimeStamp = serverTimestampSecond;
            let inboxPushObj = {};
            inboxPushObj[currentServerTimeStamp] = {
                type: 1,
                who: true,
                info: pickupinfo,
            }
            const inboxPushRef = db.collection("inbox").doc(`${transactionId}`);

            // transaction push
            const transactionPushObj = {
                postids: postids,
                pictures: pictures,
                pickupinfo: {
                    ...pickupinfo,
                    who: true,
                },
                chargeId: chargeId,
                price: totalPrice,
                firstbuy: !everbuy,
            }
            const transactionPushRef = db.collection("transaction").doc(`${transactionId}`);

            return transactionPushRef.get().then((doc) => {
                if (doc.exists) {
                    return false;
                } else {
                    let batch = db.batch();
                    // sold status update
                    for (let i = 0; i < postids.length; i++) {
                        const onePostId = postids[i];
                        const SoldUpdateOneRef = db.collection("store").doc(`${onePostId}`);
                        batch.update(SoldUpdateOneRef, { sold: true });
                    }
                    // buyer order update
                    return db.doc(`orders/${myuid}`).get().then((doc) => {
                        if (doc.exists) {
                            batch.update(orderPushRefMe, { ...orderPushObjMe });
                        } else {
                            batch.set(orderPushRefMe, { ...orderPushObjMe });
                        }
                    }).then(() => {
                        // seller order update
                        return db.doc(`orders/${selleruid}`).get().then((doc) => {
                            if (doc.exists) {
                                batch.update(orderPushRefOther, { ...orderPushObjOther });
                            } else {
                                batch.set(orderPushRefOther, { ...orderPushObjOther });
                            }
                            // transaction, inbox update
                            batch.set(transactionPushRef, { ...transactionPushObj });
                            batch.set(inboxPushRef, { ...inboxPushObj });

                            // everbuy set
                            batch.update(myUserDocRef, { everbuy: true });

                            return batch.commit().then(function () {
                                return transactionId; // transactionid
                            }).catch(function (error) {
                                console.error("Error writing document: ", error);
                            });
                        })
                    })
                }
            })
        }).catch((error) => Global.isDev && console.log(error));
    }


    getMyOrdersInboxInfo() {
        const db = firebase.firestore();
        const docRef = db.collection('orders').doc(`${this.uid}`);
        return docRef.get().then((res) => {
            if (!res.exists) {
                return null;
            }
            const myOrders = res.data();
            const transactionidArray = Object.keys(myOrders);
            transactionidArray.sort(function (x, y) {
                return parseInt(y) - parseInt(x);
            })
            let transactionRefs = [];
            let inboxRefs = [];
            for (let i = 0; i < transactionidArray.length; i++) {
                const oneTransactionId = transactionidArray[i];
                if (myOrders[oneTransactionId].status < 3) {
                    transactionRefs.push(db.collection("transaction").doc(`${oneTransactionId}`).get())
                    inboxRefs.push(db.collection("inbox").doc(`${oneTransactionId}`).get())
                }
            }
            if (isEmpty(transactionRefs[0])) return [];
            if (isEmpty(inboxRefs[0])) return [];

            return Promise.all([...transactionRefs]).then(myTransactionDocs => {
                let returnObj = [];

                for (let i = 0; i < myTransactionDocs.length; i++) {
                    const transactionid = myTransactionDocs[i].id;
                    const oneTransaction = {
                        ...myTransactionDocs[i].data(),
                        transactionid: transactionid,
                        me: myOrders[transactionid].me,
                        other: myOrders[transactionid].other,
                        status: myOrders[transactionid].status,
                    }
                    if (myOrders[transactionid].status < 3) {
                        returnObj.push(oneTransaction);
                    }
                }
                return Promise.all([...inboxRefs]).then(myInboxDocs => {
                    for (let i = 0; i < myInboxDocs.length; i++) {
                        const oneInbox = myInboxDocs[i].data();
                        returnObj[i]['chat'] = oneInbox;
                    }
                    return returnObj;
                })
            })
        }).catch(function (error) {
            Global.isDev && console.log("Error getting documents: ", error);
        });

    }


    getFriendsChatInfo() {
        const myuid = this.uid;
        const db = firebase.firestore();
        const docRef = db.collection('inboxfrndlist').doc(`${myuid}`);
        return docRef.get().then((res) => {
            if (!res.exists) {
                return null;
            }
            const myFriends = res.data();
            const myFriendUids = Object.keys(myFriends);
            const inboxRefs = myFriendUids.map((uid) => {
                if (myuid > uid) {
                    const docname = uid + myuid;
                    const ref = db.collection('inbox').doc(`${docname}`).get();
                    return ref;
                } else {
                    const docname = myuid + uid;
                    const ref = db.collection('inbox').doc(`${docname}`).get();
                    return ref;
                }
            })

            if (isEmpty(inboxRefs[0])) return null;

            return Promise.all([...inboxRefs]).then(inboxDocs => {
                let returnObj = [];
                for (let i = 0; i < inboxDocs.length; i++) {
                    if (inboxDocs[i].exists) {
                        const otheruid = myFriendUids[i];
                        const oneFriendChatObj = {
                            chat: inboxDocs[i].data(),
                            other: otheruid,
                        }
                        returnObj.push(oneFriendChatObj);
                    }
                }
                return returnObj;
            })
        }).catch(function (error) {
            Global.isDev && console.log("Error getting documents: ", error);
        });
    }


    getMyOrders(request) { // true: accepted and sold page order from homescreen, false:activeorderpage
        const Request = request;
        const db = firebase.firestore();
        const docRef = db.collection('orders').doc(`${this.uid}`);
        return docRef.get().then((res) => {
            if (!res.exists) {
                return null;
            }
            const myOrders = res.data();
            let transactionidArray = Object.keys(myOrders);
            transactionidArray = transactionidArray.reverse();

            let transactionRefs = [];
            for (let i = 0; i < transactionidArray.length; i++) {
                const oneTransactionId = transactionidArray[i];
                if (Request === 'only_status_2') {
                    if (myOrders[oneTransactionId].status === 2) {
                        transactionRefs.push(db.collection("transaction").doc(`${oneTransactionId}`).get())
                    }
                } else if (Request === 'active_orders') {
                    if (myOrders[oneTransactionId].status < 3) {
                        transactionRefs.push(db.collection("transaction").doc(`${oneTransactionId}`).get())
                    }
                }
            }
            if (isEmpty(transactionRefs[0])) return [];
            return Promise.all([...transactionRefs]).then(myTransactionDocs => {
                let returnObj = [];
                for (let i = 0; i < myTransactionDocs.length; i++) {
                    const transactionid = myTransactionDocs[i].id;
                    const oneTransaction = {
                        ...myTransactionDocs[i].data(),
                        transactionid: transactionid,
                        me: myOrders[transactionid].me,
                        other: myOrders[transactionid].other,
                        status: myOrders[transactionid].status,
                    }
                    returnObj.push(oneTransaction);
                }
                return returnObj;
            })
        }).catch(function (error) {
            Global.isDev && console.log("Error getting documents: ", error);
        });
    }


    setSoldConfirmed(transactionid, otheruid) {
        const db = firebase.firestore();
        const myuid = this.uid;
        let newOneTransactionObj = {};
        newOneTransactionObj[transactionid] = {
            me: false,
            other: otheruid,
            status: 1
        }
        return db.collection("orders").doc(`${myuid}`).update({
            ...newOneTransactionObj
        }).then(function () {
            return;
        }).catch(function (error) {
            console.error("Error writing document: ", error);
            return;
        });
    }


    getChatHistoryOneFriend(inboxName, callbackForChat) {
        const db = firebase.firestore();
        this.unsubscribeFromOneFriendChat = db.collection("inbox").doc(`${inboxName}`)
            .onSnapshot(function (snapshot) {
                callbackForChat({
                    chathistory: snapshot.data()
                });
            }, function (error) {
                Global.isDev && console.log('error', error);
            });
    }


    getChatHistoryOneTransaction(transactionid, callback) {
        const db = firebase.firestore();
        this.unsubscribeFromOneChat = db.collection("inbox").doc(`${transactionid}`)
            .onSnapshot(function (snapshot) {
                callback({
                    chathistory: snapshot.data()
                });
            }, function (error) {
                Global.isDev && console.log('error', error);
            });
    }


    getOneTransactionInfo(transactionid) {
        const db = firebase.firestore();
        const docRef = db.collection("transaction").doc(`${transactionid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                const tempObj = {
                    pickupinfo: doc.data().pickupinfo,
                    pictures: doc.data().pictures,
                }
                return tempObj;
            } else {
                // Global.isDev && console.log("No such document!");
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    getMyOneOrderInfo(transactionid) {
        const db = firebase.firestore();
        const docRef = db.collection("orders").doc(`${this.uid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                const docdata = doc.data();
                return docdata[transactionid];
            } else {
                // Global.isDev && console.log("No such document!");
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    setCallbackForTransactionStatus(transactionid, callbackForTransactionStatus) {
        const db = firebase.firestore();
        this.unsubscribeForOneTransactionStatus = db.collection("orders").doc(`${this.uid}`)
            .onSnapshot(function (snapshot) {
                const myOrdersData = snapshot.data();
                callbackForTransactionStatus({
                    status: myOrdersData[transactionid].status,
                });
            }, function (error) {
                Global.isDev && console.log('error', error);
            });
    }


    sendText(transactionid, sendtext, me, type) {
        const db = firebase.firestore();

        const myuid = this.uid;
        const myUserDocRef = db.collection("users").doc(`${myuid}`);
        return myUserDocRef.update({
            svtime: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            return myUserDocRef.get().then((doc) => {
                return doc.data().svtime.seconds;
            })
        }).then((serverTimestampSecond) => {
            const currentTimeStamp = serverTimestampSecond;
            let sendObj = {};
            sendObj[currentTimeStamp] = {
                type: type,
                who: me,
                info: sendtext
            }
            return db.collection('inbox').doc(`${transactionid}`).update({
                ...sendObj
            }).then(() => {
                return true;
            }).catch((error) => Global.isDev && console.log(error));
        }).catch((error) => Global.isDev && console.log(error))
    }


    sendTextToFriend(inboxName, sendtext, otheruid) {
        const db = firebase.firestore();
        const myuid = this.uid;
        const myUserDocRef = db.collection("users").doc(`${myuid}`);
        myUserDocRef.update({
            svtime: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            return myUserDocRef.get().then((doc) => {
                return doc.data().svtime.seconds;
            })
        }).then((serverTimestampSecond) => {
            const currentTimeStamp = serverTimestampSecond;

            let sendObj = {};
            sendObj[currentTimeStamp] = {
                uid: myuid,
                info: sendtext
            }
            let inboxfrndlistMeObj = {}, inboxfrndlistOtherObj = {};
            inboxfrndlistMeObj[otheruid] = 0;
            inboxfrndlistOtherObj[myuid] = 0;

            db.collection('inbox').doc(`${inboxName}`).get().then((doc) => {
                if (doc.exists) {
                    db.collection('inbox').doc(`${inboxName}`).update({
                        ...sendObj
                    }).catch((error) => Global.isDev && console.log(error));
                } else {
                    db.collection('inbox').doc(`${inboxName}`).set({
                        ...sendObj
                    }).then(() => {
                        db.collection('inboxfrndlist').doc(`${myuid}`).get().then((doci) => {
                            if (doci.exists) {
                                db.collection('inboxfrndlist').doc(`${myuid}`).update({
                                    ...inboxfrndlistMeObj
                                })
                            } else {
                                db.collection('inboxfrndlist').doc(`${myuid}`).set({
                                    ...inboxfrndlistMeObj
                                })
                            }
                        })

                        db.collection('inboxfrndlist').doc(`${otheruid}`).get().then((doci) => {

                            if (doci.exists) {

                                db.collection('inboxfrndlist').doc(`${otheruid}`).update({
                                    ...inboxfrndlistOtherObj
                                })
                            } else {
                                db.collection('inboxfrndlist').doc(`${otheruid}`).set({
                                    ...inboxfrndlistOtherObj
                                })
                            }
                        })

                    }).catch((error) => Global.isDev && console.log(error));
                }
            }).catch((error) => Global.isDev && console.log(error));

        }).catch(function (error) {
            console.error("Error writing document: ", error);
            return;
        });
    }


    setPickupAcceptAndDecline(transactionid, isAccept, me, otheruid, pickupTimeStampUTC) {
        const db = firebase.firestore();
        const myuid = this.uid;
        const myUserDocRef = db.collection("users").doc(`${myuid}`);
        myUserDocRef.update({
            svtime: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            return myUserDocRef.get().then((doc) => {
                return doc.data().svtime.seconds;
            })
        }).then((serverTimestampSecond) => {
            const currentTimeStamp = serverTimestampSecond;

            let ordersUpdateObjMe = {};
            ordersUpdateObjMe[transactionid] = {
                me: me,
                other: otheruid,
                status: isAccept ? 2 : 0
            }
            let ordersUpdateObjOther = {};
            ordersUpdateObjOther[transactionid] = {
                me: !me,
                other: this.uid,
                status: isAccept ? 2 : 0
            }
            let inboxUpdateObj = {};
            inboxUpdateObj[currentTimeStamp] = {
                type: isAccept ? 3 : 0,
                who: me,
            }
            let activeOrderObj = {};
            if (me) {
                activeOrderObj = {
                    buyer: myuid,
                    seller: otheruid,
                    pickup: pickupTimeStampUTC,
                    release: false,
                }
            } else {
                activeOrderObj = {
                    buyer: otheruid,
                    seller: myuid,
                    pickup: pickupTimeStampUTC,
                    release: false,
                }
            }

            let batch = db.batch();
            const ordersUpdateMeRef = db.collection("orders").doc(`${this.uid}`);
            const ordersUpdateOtherRef = db.collection("orders").doc(`${otheruid}`);
            const inboxUpdateRef = db.collection("inbox").doc(`${transactionid}`);
            const activeOrdersRef = db.collection("activeorders").doc(`${transactionid}`);
            batch.update(ordersUpdateMeRef, { ...ordersUpdateObjMe });
            batch.update(ordersUpdateOtherRef, { ...ordersUpdateObjOther });
            batch.update(inboxUpdateRef, { ...inboxUpdateObj });
            batch.set(activeOrdersRef, { ...activeOrderObj });

            batch.commit().then(function () {
            }).catch((error) => Global.isDev && console.log(error));
        }).catch((error) => Global.isDev && console.log(error))
    }


    NewProposePickup(transactionid, pickupinfo, me, otheruid) {
        const db = firebase.firestore();

        const myuid = this.uid;
        const myUserDocRef = db.collection("users").doc(`${myuid}`);
        return myUserDocRef.update({
            svtime: firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            return myUserDocRef.get().then((doc) => {
                return doc.data().svtime.seconds;
            })
        }).then((serverTimestampSecond) => {
            const currentTimeStamp = serverTimestampSecond;

            let ordersUpdateObjMe = {};
            ordersUpdateObjMe[transactionid] = {
                me: me,
                other: otheruid,
                status: 1
            }
            let ordersUpdateObjOther = {};
            ordersUpdateObjOther[transactionid] = {
                me: !me,
                other: this.uid,
                status: 1
            }
            let inboxUpdateObj = {};
            inboxUpdateObj[currentTimeStamp] = {
                type: 2,
                who: me,
                info: pickupinfo
            }

            let pickupinfoObj = {
                ...pickupinfo,
                who: me
            }

            let batch = db.batch();
            const ordersUpdateMeRef = db.collection("orders").doc(`${this.uid}`);
            const ordersUpdateOtherRef = db.collection("orders").doc(`${otheruid}`);
            const transactionUpdateRef = db.collection("transaction").doc(`${transactionid}`);
            const inboxUpdateRef = db.collection("inbox").doc(`${transactionid}`);
            batch.update(ordersUpdateMeRef, { ...ordersUpdateObjMe });
            batch.update(ordersUpdateOtherRef, { ...ordersUpdateObjOther });
            batch.update(transactionUpdateRef, { pickupinfo: { ...pickupinfoObj } });
            batch.update(inboxUpdateRef, { ...inboxUpdateObj });

            return batch.commit().then(function () {
                return;
            }).catch((error) => Global.isDev && console.log(error));

        }).catch((error) => Global.isDev && console.log(error))
    }


    getMyStoreOrLikedData(index, otheruid) { // 1:store, 2:liked 3:review 4~8 clothes, tech, home, books, other
        const uid = (otheruid === undefined) ? this.uid : otheruid;
        const db = firebase.firestore();
        let docRef;
        if (index === 1) {
            docRef = db.collection("store").where("uid", "==", uid);
        } else if (index === 2) {
            docRef = db.collection("store").where("like", "array-contains", uid);
        } else if (index === 3) {
            return;
        } else { // 4~8
            docRef = db.collection("store").where("uid", "==", uid).where("category", '==', index - 3);
        }

        return docRef.get().then(function (querySnapshot) {
                let returnArray = [];
                querySnapshot.forEach(function (doc) {
                    const postid = doc.id;
                    returnArray.push({ ...doc.data(), postid: postid });
                });
                return returnArray;
            }).catch(function (error) {
                Global.isDev && console.log("Error getting documents: ", error);
            });
    }


    setPickupSuccess(otheruid, postids, transactionid, me) {
        const db = firebase.firestore();
        const currentTimeStamp = new Date().getTime();

        // update my order status
        let myOneOrderObj = {};
        myOneOrderObj[transactionid] = {
            me: me,
            other: otheruid,
            status: 3 // means success
        }
        return db.collection('orders').doc(`${this.uid}`).update({
            ...myOneOrderObj
        }).then(() => {
            // delete activeorders transaction
            if (me) {
                db.collection("activeorders").doc(`${transactionid}`).delete().then(() => {
                    return;
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                    return;
                });
            }
            // set paid status of post items
            let batch = db.batch();
            for (let i = 0; i < postids.length; i++) {
                const postid = postids[i];
                const storeRef = db.collection("store").doc(postid);
                batch.update(storeRef, { paid: true, paidtime: currentTimeStamp });
            }
            return batch.commit().then(function () {
                return;
            }).catch((error) => Global.isDev && console.log(error));
        }).catch(function (error) {
            console.error("Error updating document: ", error);
            return;
        });
    }

    cancelOrder(transactionid, me, otheruid, postids) {

        const db = firebase.firestore();
        // update my order status
        let myOneOrderObj = {};
        myOneOrderObj[transactionid] = {
            me: me,
            other: otheruid,
            status: 4 // cancel order
        }
        db.collection('orders').doc(`${this.uid}`).update({
            ...myOneOrderObj
        }).then(function () {
            // delete activeorders transaction
            if (me) {
                db.collection("activeorders").doc(`${transactionid}`).delete().then(() => {
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                });
            }
        }).catch(function (error) {
            console.error("Error updating document: ", error);
        });

        // sold status update to false
        let batch = db.batch();
        for (let i = 0; i < postids.length; i++) {
            const onePostId = postids[i];
            const SoldUpdateOneRef = db.collection("store").doc(`${onePostId}`);
            batch.update(SoldUpdateOneRef, { sold: false });
        }
        batch.commit().then(function () {
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    leaveReview(otheruid, star, review) {
        const db = firebase.firestore();
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const todayTimeString = months[parseInt(now.getMonth())] + ' ' + now.getDate() + ', ' + now.getFullYear();
        const myReviewObj = {
            uid: this.uid,
            star: star,
            text: review,
            time: todayTimeString,
        }
        const otheruserDocRef = db.collection("users").doc(`${otheruid}`);
        return db.runTransaction(function (transaction) {
            return transaction.get(otheruserDocRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                let currentReview = sfDoc.data().review || [];
                currentReview.push(myReviewObj)
                transaction.update(otheruserDocRef, { review: currentReview });
                return;
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    getMyPurchasesAndSales(isPurchases) {
        const db = firebase.firestore();
        const docRef = db.collection('orders').doc(`${this.uid}`);
        return docRef.get().then((res) => {
            if (!res.exists) {
                return null;
            }
            const myOrders = res.data();
            const transactionidArray = Object.keys(myOrders);

            let transactionRefs = [];
            for (let i = 0; i < transactionidArray.length; i++) {
                const oneTransactionId = transactionidArray[i];
                if (myOrders[oneTransactionId].status === 3) {
                    if (isPurchases) {
                        if (myOrders[oneTransactionId].me) {
                            transactionRefs.push(db.collection("transaction").doc(`${oneTransactionId}`).get())
                        }
                    } else {
                        if (!myOrders[oneTransactionId].me) {
                            transactionRefs.push(db.collection("transaction").doc(`${oneTransactionId}`).get())
                        }
                    }

                }
            }
            if (isEmpty(transactionRefs[0])) return [];
            return Promise.all([...transactionRefs]).then(myTransactionDocs => {
                let returnObj = [];
                for (let i = 0; i < myTransactionDocs.length; i++) {
                    const oneTransactionId = myTransactionDocs[i].id;
                    const oneTransaction = {
                        other: myOrders[oneTransactionId].other,
                        postids: myTransactionDocs[i].data().postids,
                    }
                    returnObj.push(oneTransaction);
                }
                return returnObj;
            })
        }).catch(function (error) {
            Global.isDev && console.log("Error getting documents: ", error);
        });
    }


    getPostsInfo(postidsArray) {
        const db = firebase.firestore();
        let storeRefs = [];
        storeRefs = postidsArray.map(onePost => {
            return db.collection("store").doc(`${onePost}`).get()
        })
        if (isEmpty(storeRefs[0])) return {};
        return Promise.all([...storeRefs]).then(onePostQuery => {
            let returnObj = {};
            for (let i = 0; i < onePostQuery.length; i++) {
                if (onePostQuery[i].exists) {
                    const postid = onePostQuery[i].id;
                    const postdata = onePostQuery[i].data();
                    returnObj[postid] = {
                        brand: postdata.brand,
                        category: postdata.category,
                        picture: postdata.picture[0],
                        price: postdata.price,
                        size: postdata.size,
                        title: postdata.title,
                    }
                }
            }
            return returnObj;
        }).catch((error) => Global.isDev && console.log(error))
    }


    setFollow(otheruid) {
        if (this.uid === otheruid) return;
        const db = firebase.firestore();
        const myuid = this.uid;

        // set follower on other
        const otherDocRef = db.collection("users").doc(`${otheruid}`);
        db.runTransaction(function (transaction) {
            return transaction.get(otherDocRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                let currentFollowers = sfDoc.data().follower || [];
                if (!currentFollowers.includes(myuid)) currentFollowers.push(myuid);
                transaction.update(otherDocRef, { follower: currentFollowers });
            });
        }).catch((error) => Global.isDev && console.log(error));

        // set following on me
        const meDocRef = db.collection("users").doc(`${myuid}`);
        db.runTransaction(function (transaction) {
            return transaction.get(meDocRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                let currentFollowings = sfDoc.data().following || [];
                if (!currentFollowings.includes(otheruid)) currentFollowings.push(otheruid);
                transaction.update(meDocRef, { following: currentFollowings });
            });
        }).catch((error) => Global.isDev && console.log(error));
    }


    setNotification(uid, notificationObj) {// type 1~3: like, comment, follow
        const myuid = this.uid;
        if (myuid === uid) return;
        const currentTimeStamp = new Date().getTime();
        let tempObj = {};
        tempObj[currentTimeStamp] = {
            ...notificationObj,
            uid: myuid,
        }
        const db = firebase.firestore();

        db.collection('notification').doc(`${uid}`).get().then((doc) => {
            if (doc.exists) {
                db.collection('notification').doc(`${uid}`).update({
                    ...tempObj
                }).catch((error) => Global.isDev && console.log(error));
            } else {
                db.collection('notification').doc(`${uid}`).set({
                    ...tempObj
                }).catch((error) => Global.isDev && console.log(error));
            }
        }).catch((error) => Global.isDev && console.log(error));
    }


    getMyNotification() {
        const db = firebase.firestore();
        const docRef = db.collection('notification').doc(`${this.uid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                return doc.data();
            } else {
                return false;
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    getStripeCardInfo(userid) {
        const uid = (userid === undefined) ? this.uid : userid;
        const db = firebase.firestore();
        let docRef = db.collection("users").doc(`${uid}`);
        return docRef.get().then(function (doc) {
            if (doc.exists) {
                return doc.data().card;
            } else {
                Global.isDev && console.log("No such document!");
            }
        }).catch(function (error) {
            Global.isDev && console.log("Error getting document:", error);
        });
    }


    setStripeCardInfo(card) {
        const uid = this.uid;
        const docRef = firebase.firestore().collection("users").doc(`${uid}`);
        return docRef.update({
            card: card
        }).then(function () {
            return;
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    setStripeAccountId(stripeAccountId) {
        const uid = this.uid;
        const docRef = firebase.firestore().collection("users").doc(`${uid}`);
        return docRef.update({
            stAccountId: stripeAccountId
        }).then(function () {
            return;
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    getSellerAccountId(otheruid) {
        const db = firebase.firestore();
        const docRef = db.collection("users").doc(`${otheruid}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().stAccountId;
            } else {
                return '';
            }
        })
    }


    getRefundChargeId(transactionid) {
        const db = firebase.firestore();
        const docRef = db.collection("transaction").doc(`${transactionid}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().chargeId;
            } else {
                return '';
            }
        })
    }


    getPushToken(selleruid) {
        const db = firebase.firestore();
        const docRef = db.collection("users").doc(`${selleruid}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().pushtk || '';
            } else {
                return '';
            }
        })
    }


    checkEverBuy() {
        const db = firebase.firestore();
        const myuid = this.uid;
        const docRef = db.collection("users").doc(`${myuid}`);
        return docRef.get().then((doc) => {
            return doc.data().everbuy || false;
        })
    }


    catchForMySale(callbackCatchForMySale) {
        const db = firebase.firestore();
        const myuid = this.uid;
        this.unsubscribeMyOrder = db.collection("orders").doc(`${myuid}`).onSnapshot((snapshot) => {
            if (snapshot.exists) {
                const myOrdersData = snapshot.data();
                const myOrdersTransactionIdArray = Object.keys(myOrdersData);
                for (let i = myOrdersTransactionIdArray.length; i > 0; i--) {
                    const element = myOrdersTransactionIdArray[i - 1];
                    if (myOrdersData[element].status === 6) {
                        callbackCatchForMySale({
                            ...myOrdersData[element],
                            transactionId: element,
                        })
                        return;
                    }
                }
            }
        }, (error) => {
            Global.isDev && console.log(error)
        });
    }


    addEarnedToApp(postPrice, firstbuy) {
        const earend = firstbuy ? 0 : postPrice * 5 / 100;
        const transferPrice = parseFloat((postPrice - (postPrice * 29 / 1000 + 0.3) - (postPrice * 5 / 100)).toFixed(2));
        const db = firebase.firestore();
        const appDocRef = db.collection("app").doc("statistics");
        db.runTransaction((transaction) => {
            return transaction.get(appDocRef).then(function (sfDoc) {
                if (sfDoc.exists) {
                    const currentEarned = sfDoc.data().earn || 0;
                    const currentSent = sfDoc.data().sent || 0;
                    const newEarned = parseFloat((currentEarned + earend).toFixed(2));
                    const newSent = parseFloat((currentSent + transferPrice).toFixed(2));
                    transaction.update(appDocRef, { earn: newEarned, sent: newSent });
                }
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });

        const now = new Date();
        const year = now.getFullYear();
        let month = now.getMonth() + 1; // 1~12
        let date = now.getDate();
        const appIcDocRef = db.collection("app").doc(`ic${year}`);
        db.runTransaction((transaction) => {
            return transaction.get(appIcDocRef).then(function (sfDoc) {
                if (sfDoc.exists) {
                    let currentMonthObj = sfDoc.data()[month] || {};
                    const currentDateEarned = currentMonthObj[date] || 0;
                    const newEarned = parseFloat((currentDateEarned + earend).toFixed(2));
                    currentMonthObj[date] = newEarned;
                    let monthObj = {}; monthObj[month] = currentMonthObj;
                    transaction.update(appIcDocRef, { ...monthObj });
                } else {
                    let dateObj = {}; dateObj[date] = parseFloat(earend.toFixed(2));
                    let monthObj = {}; monthObj[month] = dateObj;
                    transaction.set(appIcDocRef, { ...monthObj });
                }
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    addEarnedToSeller(uid, earned) {
        const db = firebase.firestore();
        const myUserDocRef = db.collection("users").doc(`${uid}`);
        return db.runTransaction((transaction) => {
            return transaction.get(myUserDocRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                const currentEarned = sfDoc.data().earned || 0;
                const newEarned = parseFloat(currentEarned) + parseFloat(earned);
                transaction.update(myUserDocRef, { earned: newEarned.toFixed(2) });
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    getMyEarned() {
        const db = firebase.firestore();
        const myuid = this.uid;
        const myUserDocRef = db.collection("users").doc(`${myuid}`);

        return myUserDocRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().earned || 0;
            }
        })
    }


    checkUsernameDuplicate(username) {
        const db = firebase.firestore();
        const EmailDocRef = db.collection("email").doc(`${username}`);
        return EmailDocRef.get().then((doc) => {
            if (doc.exists) {
                return true;
            } else {
                return false;
            }
        })
    }


    getEmail(username) {
        const db = firebase.firestore();
        const EmailDocRef = db.collection("email").doc(`${username}`);
        return EmailDocRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().mail;
            } else {
                return 'error_notexits';
            }
        })
    }


    changeUsernameForEmail(oldusername, username) {
        const myEmail = this.email;
        const db = firebase.firestore();
        db.collection("email").doc(`${username}`).set({
            mail: myEmail
        }).then(() => {
            db.collection("email").doc(`${oldusername}`).delete().then(() => {

            }).catch(function (error) {
                console.error("Error removing document: ", error);
            });
        }).catch((error) => console.error(error));
    }


    unSubscribe(type) {
        if (type === 'orderchat') {
            this.unsubscribeFromOneChat();
            this.unsubscribeForOneTransactionStatus();
        } else if (type === 'friendchat') {
            this.unsubscribeFromOneFriendChat();
        } else if (type === 'signout') {
            this.unsubscribeMyOrder && this.unsubscribeMyOrder();
        }
    }


    checkAutoReleased(transactionid) {
        const db = firebase.firestore();
        const docRef = db.collection("activeorders").doc(`${transactionid}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().release;
            } else {
                return false;
            }
        })
    }


    getFollowList(uid, isFollowers) {
        const db = firebase.firestore();
        let docRef = db.collection("users").doc(`${uid}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                const userprofile = doc.data();
                if (isFollowers) {
                    return userprofile.follower || [];
                } else {
                    return userprofile.following || [];
                }
            } else {
                return [];
            }
        }).then((uidarray) => {
            if (uidarray.length === 0) {
                return [];
            }
            let returnObj = [];
            let userDocRefs = [];
            for (let i = 0; i < uidarray.length; i++) {
                const oneuid = uidarray[i];
                userDocRefs.push(db.collection("users").doc(`${oneuid}`).get())
            }
            if (isEmpty(userDocRefs[0])) return [];
            return Promise.all([...userDocRefs]).then(userDocs => {
                for (let i = 0; i < userDocs.length; i++) {
                    const userid = userDocs[i].id;
                    const userprofile = userDocs[i].data();
                    returnObj.push({
                        uid: userid,
                        avatar: userprofile.avatar,
                        username: userprofile.username,
                        name: userprofile.name,
                    })
                }
                return returnObj;
            })
        }).catch(function (error) {
            return [];
        });
    }


    setMyFollowingList(myfollowinglist) {
        const uid = this.uid;
        var docRef = firebase.firestore().collection("users").doc(`${uid}`);
        docRef.update({
            "following": myfollowinglist,
        }).catch((error) => {
            Global.isDev && console.log(error)
        })
    }


    reportUser(reportObj, text) {
        const db = firebase.firestore();
        const myuid = this.uid;
        let reportDocName = '';
        if (reportObj.from_uid > reportObj.to_uid) {
            reportDocName = reportObj.to_uid + reportObj.from_uid;
        } else {
            reportDocName = reportObj.from_uid + reportObj.to_uid;
        }
        const reportDocRef = db.collection("report").doc(reportDocName);
        return db.runTransaction((transaction) => {
            return transaction.get(reportDocRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    let report = []; report.push({ who: true, text: text });
                    const tempObj = {
                        ...reportObj,
                        report: report,
                    }
                    transaction.set(reportDocRef, { ...tempObj });
                } else {
                    let report = sfDoc.data().report || [];
                    let lastObj = {};
                    if (reportObj.from_uid === myuid) {
                        lastObj = {
                            who: true,
                            text: text,
                        }
                    } else {
                        lastObj = {
                            who: false,
                            text: text,
                        }
                    }
                    report.push(lastObj);
                    transaction.update(reportDocRef, { report: report });
                }
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    getEmailByUserName(username) {
        const db = firebase.firestore();
        const docRef = db.collection("email").doc(`${username}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                return doc.data().mail || '';
            } else {
                return '';
            }
        })
    }


    getReportList() {
        const db = firebase.firestore();
        return db.collection("report").get().then((querySnapshot) => {
            let returnArray = [];
            querySnapshot.forEach(function (doc) {
                const oneDocData = {
                    ...doc.data(),
                    report_id: doc.id
                };
                returnArray.push(oneDocData);
            });
            return returnArray;
        })
    }


    deleteOneReport(report_id) {
        const db = firebase.firestore();
        return db.collection("report").doc(`${report_id}`).delete().then(() => {
            return;
        }).catch(function (error) {
            console.error("Error removing document: ", error);
            return;
        });
    }


    getUserInfoForReportList(uidarray) {
        const db = firebase.firestore();
        let refs = [];
        try {
            refs = uidarray.map(uid => {
                if (uid !== '') return db.collection("users").doc(`${uid}`).get()
            })

            return Promise.all([...refs]).then(result => {
                let returnObj = {};
                for (let i = 0; i < result.length; i++) {
                    const userid = uidarray[i];
                    if (result[i].exists) {
                        userprofile = result[i].data();
                        returnObj[userid] = {
                            username: userprofile.username,
                            avatar: userprofile.avatar,
                            type: userprofile.status || 0 // 0:general, 1:suspend, 2:deleted
                        }
                    } else {
                        returnObj[userid] = {
                            username: '',
                            avatar: '',
                            type: 2,
                        }
                    }
                }
                return returnObj;
            })
        } catch (error) {
            Global.isDev && console.log('error', error);
            return null
        }
    }


    async deletePostImagesOnStorage(onePostId, length) {
        const storageRef = firebase.storage().ref();
        for (let i = 0; i < length; i++) {
            const deleteRef = storageRef.child('store/' + onePostId + '_' + i + '.png');
            try {
                await deleteRef.delete()
            } catch (error) {
                Global.isDev && console.log(error)
            }
        }

    }


    deleteAvatarImageOnStorage(uid) {
        const storageRef = firebase.storage().ref();
        const deleteRef = storageRef.child('avatar/' + uid + '.png');
        deleteRef.delete().then(function () {
        }).catch(function (error) {
            Global.isDev && console.log(error)
        });
    }


    closeAccount(userid) {
        const db = firebase.firestore();
        const uid = (userid === undefined) ? this.uid : userid;

        let deleteDocRefs = [];
        const myOrderDocRef = db.collection('orders').doc(`${uid}`);
        return myOrderDocRef.get().then((res) => {
            if (!res.exists) {
                return;
            }
            const myOrders = res.data();
            const myTransactionIds = Object.keys(myOrders);

            for (let i = 0; i < myTransactionIds.length; i++) {
                const element = myTransactionIds[i];
                let deleteObj = {}; deleteObj[element] = firebase.firestore.FieldValue.delete();
                deleteDocRefs.push(db.collection('orders').doc(myOrders[element].other).update({
                    ...deleteObj
                }))
                deleteDocRefs.push(db.collection('orders').doc(uid).delete());
                deleteDocRefs.push(db.collection('transaction').doc(element).delete());
                deleteDocRefs.push(db.collection('inbox').doc(element).delete());
            }
        }).then(() => {
            // friend chat cleaning
            return db.collection('inboxfrndlist').doc(uid).get().then(inboxfriendDoc => {
                if (inboxfriendDoc.exists) {
                    const myFriends = Object.keys(inboxfriendDoc.data())
                    return myFriends;
                } else {
                    return null;
                }
            }).then(myFriends => {
                if (myFriends !== null) {
                    for (let i = 0; i < myFriends.length; i++) {
                        const element = myFriends[i]; // myFriend uid
                        let deleteFriendInboxDocRef;
                        if (uid > element) {
                            deleteFriendInboxDocRef = element + uid;
                        } else {
                            deleteFriendInboxDocRef = uid + element;
                        }
                        deleteDocRefs.push(db.collection('inbox').doc(deleteFriendInboxDocRef).delete());
                        let tempObj = {}; tempObj[`${myFriends[i]}`] = firebase.firestore.FieldValue.delete();
                        deleteDocRefs.push(db.collection('inboxfrndlist').doc(`${element}`).update({
                            ...tempObj
                        }))
                    }
                    deleteDocRefs.push(db.collection('inboxfrndlist').doc(uid).delete());
                }
            })
        }).then(() => {
            // store cleaning
            return db.collection('store').where('uid', '==', uid).get().then(myPostsDocs => {
                myPostsDocs.forEach(async (element) => { // one post
                    const onePostId = element.id;
                    const onePostData = element.data();
                    const onePostImages = onePostData.picture;
                    await this.deletePostImagesOnStorage(onePostId, onePostImages.length);
                    deleteDocRefs.push(db.collection('store').doc(onePostId).delete());
                });
            })
        }).then(() => {
            return db.collection('users').doc(uid).get().then(async (userDoc) => {
                if (userDoc.exists) {
                    const userProfile = userDoc.data();
                    await this.deleteAvatarImageOnStorage(uid);
                    const myFollowers = userProfile.follower || [];
                    const myFollowings = userProfile.following || [];
                    for (let i = 0; i < myFollowers.length; i++) {
                        const followerDocRef = db.collection("users").doc(myFollowers[i]);
                        db.runTransaction((transaction) => {
                            return transaction.get(followerDocRef).then(function (sfDoc) {
                                if (sfDoc.exists) {
                                    let currentFollowing = sfDoc.data().following || [];
                                    for (var i = 0; i < currentFollowing.length; i++) {
                                        if (currentFollowing[i] === uid) {
                                            currentFollowing.splice(i, 1);
                                        }
                                    }
                                    transaction.update(followerDocRef, { following: currentFollowing });
                                }
                            });
                        }).catch(function (error) {
                            Global.isDev && console.log("Transaction failed: ", error);
                        });
                    }

                    for (let i = 0; i < myFollowings.length; i++) {
                        const followingDocRef = db.collection("users").doc(myFollowings[i]);
                        db.runTransaction((transaction) => {
                            return transaction.get(followingDocRef).then(function (sfDoc) {
                                if (sfDoc.exists) {
                                    let currentFollowers = sfDoc.data().follower || [];
                                    for (var i = 0; i < currentFollowers.length; i++) {
                                        if (currentFollowers[i] === uid) {
                                            currentFollowers.splice(i, 1);
                                        }
                                    }
                                    transaction.update(followingDocRef, { follower: currentFollowers });
                                }
                            });
                        }).catch(function (error) {
                            Global.isDev && console.log("Transaction failed: ", error);
                        });
                    }
                    // gender change
                    const appDocRef = db.collection("app").doc("statistics");
                    db.runTransaction((transaction) => {
                        return transaction.get(appDocRef).then(function (sfDoc) {
                            if (sfDoc.exists) {
                                const docdata = sfDoc.data();
                                const userstatistics = {
                                    men: docdata.men - (userProfile.gender === 1 ? 1 : 0),
                                    women: docdata.women - (userProfile.gender === 2 ? 1 : 0),
                                    notsay: docdata.notsay - (userProfile.gender === 3 ? 1 : 0),
                                };
                                transaction.update(appDocRef, { ...userstatistics });
                            }
                        });
                    })
                    // set user status to 2
                    db.collection("users").doc(uid).update({
                        status: 2
                    }).catch(() => { });

                    deleteDocRefs.push(db.collection('email').doc(userProfile.username).delete());
                    // deleteDocRefs.push(db.collection('users').doc(uid).delete());
                }
            })
        }).then(() => {
            deleteDocRefs.push(db.collection('location').doc(uid).delete());
            deleteDocRefs.push(db.collection('notification').doc(uid).delete());
            return Promise.all([...deleteDocRefs]).then(() => {
                return;
            }).catch((error) => { Global.isDev && console.log(error) });
        }).catch((error) => { Global.isDev && console.log(error) })
    }


    getUserStatistics() {
        const db = firebase.firestore();
        const docRef = db.collection('app').doc('statistics');
        return docRef.get().then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                const statistics_data = {
                    men: docData.men || 0,
                    women: docData.women || 0,
                    notsay: docData.notsay || 0,
                }

                const currentTimeStamp = new Date().getTime();
                const timeStampOneDayAgo = currentTimeStamp - (24 * 3600 * 1000);
                const oneDayVisitorsRef = db.collection('users').where("lastlogin", ">", timeStampOneDayAgo);
                return oneDayVisitorsRef.get().then((docs) => {
                    const visitors_oneday = docs.size;
                    return {
                        ...statistics_data,
                        visitors_oneday,
                    }
                })
            }
        })
    }


    increaseEngagementCount() {
        const db = firebase.firestore();
        const appStatisticsRef = db.collection("app").doc("statistics");

        db.runTransaction((transaction) => {
            return transaction.get(appStatisticsRef).then(function (sfDoc) {
                if (sfDoc.exists) {
                    const egtotal = sfDoc.data().egtotal || 0;
                    transaction.update(appStatisticsRef, { egtotal: egtotal + 1 });
                }
            });
        })

        const now = new Date();
        const year = now.getFullYear();
        let month = now.getMonth() + 1; // 1~12
        const hour = now.getHours();
        let date = now.getDate();
        if (month < 10) {
            month = '0' + month.toString();
        }

        const appEngagementRef = db.collection("app").doc(`eg${year}${month}`);
        db.runTransaction((transaction) => {
            return transaction.get(appEngagementRef).then(function (sfDoc) {
                if (sfDoc.exists) {
                    let currentDateObj = sfDoc.data()[date] || {};
                    const currentCount = currentDateObj[hour] || 0;
                    currentDateObj[hour] = currentCount + 1;
                    let dateObj = {}; dateObj[date] = currentDateObj;
                    transaction.update(appEngagementRef, { ...dateObj });
                } else {
                    let hourObj = {}; hourObj[hour] = 1;
                    let dateObj = {}; dateObj[date] = hourObj;
                    transaction.set(appEngagementRef, { ...dateObj });
                }
            });
        }).catch(function (error) {
            Global.isDev && console.log("Transaction failed: ", error);
        });
    }


    getEngagementTotal() {
        const db = firebase.firestore();
        const appStatisticsRef = db.collection('app').doc('statistics');
        return appStatisticsRef.get().then((doc) => {
            let total_eg = 0;
            if (doc.exists) {
                total_eg = doc.data().egtotal || 0;
            } else {
                total_eg = 0;
            };
            return total_eg;
        }).catch((error) => {
            Global.isDev && console.log(error);
            return null;
        })
    }


    getEngagementOneMonth(m, y) { // m:1~12
        const db = firebase.firestore();
        const year = y.toString();
        let month = m.toString();
        if (m < 10) {
            month = '0' + month;
        }

        const month_string = year.toString() + month;
        const appEngagementRef = db.collection("app").doc(`eg${month_string}`);

        return appEngagementRef.get().then(doc => {
            if (doc.exists) {
                return doc.data();
            } else {
                return null;
            }
        })
    }


    setUserSuspend(uid, disabled) {
        const db = firebase.firestore();
        db.collection("users").doc(`${uid}`).update({
            status: disabled ? 1 : 0
        }).then(function () {

        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }


    getPostsNumberOneMonth(startTimeStamp, endTimeStamp) {
        const db = firebase.firestore();
        let returnArray = [];
        return db.collection("store").where("time", ">", startTimeStamp).where("time", "<", endTimeStamp).get().then((docs) => {
            docs.forEach(function (doc) {
                returnArray.push({
                    time: doc.data().time,
                    category: doc.data().category,
                });
            })
            return returnArray
        })
    }


    getSoldItemsOneMonth(startTimeStamp, endTimeStamp) {
        const db = firebase.firestore();
        let returnArray = [];
        return db.collection("store").where("paid", "==", true).where("time", ">", startTimeStamp).where("time", "<", endTimeStamp).orderBy("time", 'desc').get().then((docs) => {
            docs.forEach(function (doc) {
                const docdata = doc.data();
                returnArray.push({
                    picture: docdata.picture[0] || '',
                    price: docdata.price || 0,
                    uid: docdata.uid || '',
                    time: docdata.paidtime || 0,
                    title: docdata.title || 0,
                    category: docdata.category,
                    brand: docdata.brand || '',
                });
            })
            return returnArray
        }).catch(() => {
            return [];
        })
    }


    getSoldNumberOneMonth(startTimeStamp, endTimeStamp) {
        const db = firebase.firestore();
        let returnArray = [];
        return db.collection("store").where("paid", "==", true).where("time", ">", startTimeStamp).where("time", "<", endTimeStamp).get().then((docs) => {
            docs.forEach(function (doc) {
                returnArray.push({
                    time: doc.data().paidtime,
                    category: doc.data().category,
                });
            })
            return returnArray
        })
    }


    getIncomeStatistics() {
        const db = firebase.firestore();
        const docRef = db.collection('app').doc('statistics');
        return docRef.get().then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                return {
                    total_earn: docData.earn || 0,
                    sent_amount: docData.sent || 0,
                }
            }
        })
    }


    getIncomeOneYear(year) {
        const db = firebase.firestore();
        const docRef = db.collection('app').doc(`ic${year}`);
        return docRef.get().then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                return docData;
            }
        }).catch(error => {
            Global.isDev && console.log(error);
            return null;
        })
    }


    checkAdmin(email) {
        const mail = (email === undefined) ? this.email : email;
        const db = firebase.firestore();
        const docRef = db.collection('app').doc('admins');
        return docRef.get().then((doc) => {
            if (doc.exists) {
                const docData = doc.data();
                const emails = Object.values(docData);
                return emails.includes(mail);
            } else {
                return false;
            }
        }).catch(error => {
            return false;
        })
    }

}

Fire.shared = new Fire();
export default Fire;