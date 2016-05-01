'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/updateUser';

let db;
let SimpleResponse;
let User;

module.exports = {
    parameterVariations: [
        {
            // 'id' : 'exists'
        }
    ],
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let res = new SimpleResponse({success: false});
        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if(session === undefined) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        let sessionUserId = session.userId;
        let newUserInfo = _args;
        
        if(newUserInfo.id === undefined) {
            newUserInfo.id = sessionUserId;
        }

        if (newUserInfo.id === sessionUserId) {

            // prüfen ob informationen dabei sind, die nicht verändert werden dürfen
            if (newUserInfo.mail !== undefined) {
                reject({code: 'client', string: 'you are not allowed to change the mail-address'});
            } else if (newUserInfo.displayname !== undefined) {
                reject({code: 'client', string: 'you are not allowed to change the displayname'});
            }

            // neuen user mit nur zulässigen attributen erzeugen
            let userInfo = new User(newUserInfo);
            delete userInfo.id; // id wird nicht benötigt

            // userinformationen aktualisieren
            resolve(db.updateUser({_id: sessionUserId}, userInfo.toJSON()).then(
                () => {
                    res.success = true;
                    return res;
                }, (_err) => {
                    reject({code: 'server', string: _err});
                    console.log(_err);
                })
            );

        } else {
            reject(_env.ErrorHandler.returnError(4005));
        }
    })
};