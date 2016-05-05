'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/GetUserInfo';

let db;
let User;

module.exports = {
    parameterVariations: [
        {}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if(!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        let user;

        // user suchen und zurückgeben
        resolve(User.getLoggedIn(_ws, db)
            .then((_user) => {
                user = _user;

                if(user === undefined) {
                    _env.ErrorHandler.throwError(3008);
                }

                _env.debug(METHOD_NAME, JSON.stringify(user));

                if(user._id == undefined || user.password == undefined) {
                    _env.ErrorHandler.throwError(4008);
                }

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