'use strict';

const METHOD_NAME = 'AdminService/cleanup';

let db;

module.exports = {
    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((go, fail) => {

        const collections = {
            sessions: true,
            users: true,
            messages: true,
            rooms: true,
            doorLocks: true
        };

        if(collections[_args.collection] !== true) {
            fail(_env.ErrorHandler.returnError(5002));
        }

        _env.debug(METHOD_NAME, `!!! ${_args.collection.toUpperCase()} CLEANUP !!!`);
        go(db.getDb().collection(_args.collection).removeMany({}));

    })
};
