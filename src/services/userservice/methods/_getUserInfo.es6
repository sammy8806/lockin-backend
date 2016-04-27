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

        let user = _args.user;
        let search = user;

        // user suchen und zurückgeben
        resolve(db.findUser(search).toArray()
            .then((_user) => {
                user = _user[0];

                // A bit fixing here
                user.id = user._id;
                delete user._id;

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