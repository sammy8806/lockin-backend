'use strict';

const METHOD_NAME = 'UserService/findUser';

let db;

module.exports = {
    parameterVariations: [
        {}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
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
            query = {email: email}
        } else if (name) {
            query = {name: name}
        } else {
            //invalid parameters
            reject(_env.ErrorHandler.returnError(3002));
        }

        resolve(db.findUser(query).toArray().then((_user) => {
            _env.debug(METHOD_NAME, `Search done. ${_user.length} results found.`);
            _env.debug(METHOD_NAME, JSON.stringify(_user));

            let user;

            user = _user[0];

            if (user === undefined || _user.length === 0) {
                _env.ErrorHandler.throwError(3002);
            }

            return user.key.id;
        }));
    })
};
