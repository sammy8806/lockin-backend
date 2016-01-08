'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/ChangeUserInfo';

let db;
let SimpleResponse;
let User;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let res = new SimpleResponse({success: false});
        let sessionUserId = _env.sessionmanager.getSessionOfSocket(_ws).userId;
        let newUserInfo = _args[0];

        if (newUserInfo.id === sessionUserId) {

            // prüfen ob informationen dabei sind, die nicht verändert werden dürfen
            if (newUserInfo.mail !== undefined) {
                reject({code: 'client', string: 'u are not allowed to change the mail-address'});
            } else if (newUserInfo.displayname !== undefined) {
                reject({code: 'client', string: 'u are not allowed to change the displayname'});
            }

            // neuen user mit nur zulässigen attributen erzeugen
            let userInfo = new User(newUserInfo);

            // userinformationen aktualisieren
            db.updateUser({id: newUserInfo.id}, userInfo);
            res.success = true;
        } else {
            reject({code: 'client', string: 'u cannot change information of other users'});
        }

        resolve(res);
    })
};