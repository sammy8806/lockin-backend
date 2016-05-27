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
        const lockId = _args.lockId;

        _env.debug(METHOD_NAME, 'Searching User by KeyData and keyId');

        return resolve(db.findUser({key: _args.key}).toArray().then((_user) => {
            let user = _user[0];

            if (!user) {
                _env.debug(METHOD_NAME, 'Invalid key');
                _env.ErrorHandler.throwError(6004);
            }

            _env.debug(METHOD_NAME, 'Key Data is valid');

            //check masterkeys of doorlock
            return db.findDoorLockByIdAndMasterkey(lockId, _args.key).toArray().then((_doorLocks) => {
                if (_doorLocks.length > 0) {
                    _env.debug(METHOD_NAME, `${lockId} Access Granted! With masterkey: ${keyId}`);
                    return true;
                } else {
                    _env.debug(METHOD_NAME, 'No masterkey found');
                }

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
            });
        }));
    })
};