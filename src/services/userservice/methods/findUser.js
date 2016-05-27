'use strict';

const METHOD_NAME = 'UserService/findUser';

let db;
let User;

module.exports = {
    parameterVariations: [
        {email: 'exists'},
        {name: 'exists'},
        {key: 'exists'}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const session = _env.sessionmanager.getSessionOfSocket(_ws);

        if (session === undefined) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        //find userkey by mail or name
        let queryUser = new User(_args);

        if (queryUser.toJSON().length < 1) {
            //invalid parameters
            reject(_env.ErrorHandler.returnError(4010));
            return;
        }

        resolve(db.findUser(queryUser.toJSON()).toArray().then((_users) => {
            _env.debug(METHOD_NAME, `Search done. ${_users.length} results found.`);
            _env.debug(METHOD_NAME, JSON.stringify(_users));

            if (_users === undefined || _users.length === 0) {
                _env.ErrorHandler.throwError(3002);
            }

            let userList = [];

            _users.forEach(function (user) {
                user = new User(user);

                // Strip sensitive data
                if (user.key.data !== undefined) {
                    user.key.data = undefined;
                }

                if (user.password !== undefined) {
                    user.password = undefined;
                }

                if (user.session !== undefined) {
                    user.session = undefined;
                }

                userList.push(user.toJSON());
            });

            return userList;
        }));
    })
};
