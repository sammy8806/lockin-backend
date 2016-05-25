'use strict';

const METHOD_NAME = 'UserService/findUser';

let db;
let User;

module.exports = {
    parameterVariations: [
        {email: 'exists'},
        {name: 'exists'}
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
        let email = _args.email;
        let name = _args.name;
        let query;

        if (email) {
            query = {email: email};
        } else if (name) {
            query = {name: name};
        } else {
            //invalid parameters
            reject(_env.ErrorHandler.returnError(3002));
        }

        resolve(db.findUser(query).toArray().then((_users) => {
            _env.debug(METHOD_NAME, `Search done. ${_users.length} results found.`);
            _env.debug(METHOD_NAME, JSON.stringify(_users));

            if (_users === undefined || _users.length === 0) {
                _env.ErrorHandler.throwError(3002);
            }

            let userList = [];

            _users.forEach(function (user) {
                userList.push((new User(user)).toJSON());
            });

            return _users;
        }));
    })
};
