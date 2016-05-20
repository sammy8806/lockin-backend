'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/getLockInfo';

let db;
let DoorLock;
let User;
let SimpleResponse;

module.exports = {
    parameterVariations: [
        {
            id: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        DoorLock = _env.ObjectFactory.get('DoorLock');
        User = _env.ObjectFactory.get('User');
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        let user;

        resolve(User.getLoggedIn(_ws, db)
            .then((_user) => {

                user = _user;

                if (user === undefined) {
                    _env.ErrorHandler.throwError(3002);
                }

                return db.findDoorLock({id: _args.id}).toArray().then((_doorLocks) => {
                    return new DoorLock(_doorLocks[0]).toJSON();
                });
            }));
    })
};