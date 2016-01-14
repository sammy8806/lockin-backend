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

        let user = _args;
        let search = null;

        // suchkriterium anhand id oder mail festlegen
        if (user.id !== undefined)
            search = {_id: user.id};
        else if (user.mail !== undefined)
            search = {mail: user.mail};
        else
            reject({code: 'client', string: 'wrong search information'});

        // user suchen und zurückgeben
        resolve(db.findUser(search).toArray()
            .then((_user) => {
                user = _user[0];
                delete user.password;
                return user;
            }),
            (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            }
        );
    })
};