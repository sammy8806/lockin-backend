'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/getName';

let getUserInfo;
let User;

module.exports = {
    setup: (_env) => {
        getUserInfo = _env.ServiceFactory.getService('UserService').getFunc('_getUserInfo');
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let user = _args.user;
        let search = null;

        // suchkriterium anhand id oder mail festlegen
        if (user.name !== undefined) {
            search = {_id: user.name};
        } else {
            reject({code: 'client', string: 'wrong search information'});
        }

        // user suchen und zurückgeben
        resolve(
            getUserInfo.call(search, _env, _ws, _type)
                .then((userInfo) => userInfo.name),
            (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            }
        );
    })
};