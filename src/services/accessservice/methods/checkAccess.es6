'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/checkAccess';

let db;
let Log;

module.exports = {
    parameterVariations: [
        {
            key: 'exists',
            lockId: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Log = _env.ObjectFactory.get('Log');
    },
    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const keyId = _args.key.id;
        const keyData = _args.key.data;
        const lockId = _args.lockId;

        _env.debug(METHOD_NAME, 'Searching User by KeyId');

        return resolve(db.findUser({'key.id': keyId}).toArray().then((_user) => {
            let user = _user[0];

            if (!user) {
                _env.debug(METHOD_NAME, 'user with keyId does not exist');
                _env.ErrorHandler.throwError(4006);
            }

            //validate key
            if (user.key.data !== keyData) {
                _env.debug(METHOD_NAME, 'Key Data invalid');
                _env.ErrorHandler.throwError(6004);
            }

            _env.debug(METHOD_NAME, 'Key Data is valid');
            
            return db.findAccessByRequestorAndTimeAndlockId(keyId, new Date(), lockId).toArray().then((_access) => {

                let access = _access[0];

                let res = access !== undefined && _access.length > 0;

                let logEntry = new Log({
                    requestorId: keyId,
                    lockId: lockId,
                    ownerId: null,
                    date: new Date().getTime(),
                    actionState: null
                });

                if (res) {
                    logEntry.actionState = 'OK';
                    _env.debug(METHOD_NAME, `${lockId} Access Granted! ${keyId}`);
                } else {
                    logEntry.actionState = 'DENIED';
                    _env.debug(METHOD_NAME, `${lockId} Access Denied! ${keyId}`);
                }

                // Async Insert
                db.addLogEntry(logEntry.toJSON());

                _env.debug(METHOD_NAME, 'Done');

                return res;
            });
        }));
    })
};