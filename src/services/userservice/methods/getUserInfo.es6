'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/GetUserInfo';

let db;
let User;

module.exports = {
    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let user = args[0];

        // user anhand id oder mail suchen und neu zuweisen
        if (user.id !== undefined) {
            db.findUser({id: user.id}).toArray()
                .then((_user) => {
                        user = _user[0];
                    },
                    (_err) => {
                        reject({code: 'server', string: _err});
                        console.log(_err);
                    });
        } else if (_args[0].mail !== undefined) {
            db.findUser({mail: user.mail}).toArray()
                .then((_user) => {
                        user = _user[0];
                    },
                    (_err) => {
                        reject({code: 'server', string: _err});
                        console.log(_err);
                    });
        } else {
            reject({code: 'client', string: 'wrong search information'});
        }

        // passwordhash entfernen
        delete user.passwordHash;

        // user zurückgeben
        resolve(user);
    })
};