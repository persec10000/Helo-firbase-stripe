import Global from '@utils/GlobalValue';
import Fire from '@utils/Firebase';
import isEmpty from '@utils/isEmpty';


export function sendPushNotification(sendToUid, type) {
    Fire.shared.getPushToken(sendToUid).then((res) => {
        if (isEmpty(res)) {
            return;
        }
        const pushtoken = res;
        let pushBody = '';
        if (type === 'bought') {
            pushBody = "someone bought your item!";
        } else if (type === 'released') {
            pushBody = "buyer released money to you!";
        }
        fetch(Global.PUSH_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: pushtoken,
                sound: "default",
                title: "Notification",
                body: pushBody
            }),
        });
    }).catch((error) => Global.isDev && console.log(error));
}


export function sendEmailToAdminForReportUser(mailObj) {
    try {
        fetch(Global.sendEmailUrlForReportUser, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...mailObj
            })
        })
    } catch (error) {
        Global.isDev && console.log(error)
    }
}

// user disable enable
export function setUserSuspend(uid, disabled) {
    try {
        const setUserStatusUrl = 'https://www.theheloapp.com/_functions/setUserStatus';
        return fetch(setUserStatusUrl, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: uid,
                disabled: disabled,
            })
        }).then((result) => { // 'ok' or 'error'
            return result.json().then((resultjson) => {
                if (resultjson.result === 'ok') {
                    Fire.shared.setUserSuspend(uid, disabled);
                    return true;
                }
            })
        }).catch(() => {
            return false;
        })
    } catch (error) {
        Global.isDev && console.log(error)
        return false;
    }
}

// remove user auth
export function removeUser(uid) {
    try {
        const removeUserUrl = 'https://www.theheloapp.com/_functions/removeUser';
        return fetch(removeUserUrl, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: uid,
            })
        }).then((result) => { // 'ok' or 'error'
            return result.json().then((resultjson) => {
                if (resultjson.result === 'ok') {
                    Fire.shared.setUserSuspend(uid, disabled);
                    return true;
                }
            })
        }).catch(() => {
            return false;
        })
    } catch (error) {
        Global.isDev && console.log(error)
        return false;
    }
}