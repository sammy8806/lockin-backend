'use strict';

const METHOD_NAME = 'LogService/findLog';

let db;
let User;
let Session;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        User = _env.ObjectFactory.get('User');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            _env.ErrorHandler.throwError(4008);
        }

        if (!User.isLoggedIn(_ws)) {
            _env.ErrorHandler.throwError(4005);
        }

        let data = User.getLoggedIn(_ws, db)
        .then((_user) => {
            // TODO: STUB!
        });
        resolve(data);
    })
};
