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
        let newUserInfo = _args[0];

        if (newUserInfo.id === undefined) { // wenn id von user nicht bekannt
            if (newUserInfo.mail !== undefined) { // wenn aber mail bekannt
                let user = db.findUser({mail: newUserInfo.mail}); // user anhand der mail suchen
                newUserInfo.id = user.id;
            } else {
                reject({code: 'client', string: 'cannot find user (wrong search information)'});
            }
        }

        // userinformationen aktualisieren
        db.updateUser({id: newUserInfo.id}, newUserInfo);
        res.success = true;

        resolve(res);
    })
};