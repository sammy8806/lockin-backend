'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/registerDoorLock';

let db;
let DoorLock;
let User;
let SimpleResponse;

module.exports = {
    parameterVariations: [
        {
            id: 'exists',
            name: 'exists',
            masterKeys: 'exists',
            state: 'exists'
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
                    _env.ErrorHandler.throwError(7003);
                }

                let id = _args.id;

                //add key id of creator to lock
                _args.keyId = user.key.id;

                console.log(_args);

                //check if doorlockid already exists
                return db.findDoorLock({id: id}).toArray().then(function (_doorLocks) {
                    if (_doorLocks.length !== 0) {
                        _env.debug(METHOD_NAME, 'Doorlock already exists');
                        _env.ErrorHandler.throwError(7005);
                    }

                    let newDoorLock = new DoorLock(_args);

                    _env.debug(METHOD_NAME, `Saving doorlock to database`);

                    return db.insertDoorLock(newDoorLock).then(() => {
                        return new SimpleResponse({success: true});
                    });
                });
            }));
    })
};