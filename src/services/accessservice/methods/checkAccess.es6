'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/checkAccess';

let db;

module.exports = {
    parameterVariations: [
        {
            keyId: 'exists',
            lockId: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        let res = false;

        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if (session === undefined) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        const keyId = _args.keyId;
        const lockId = _args.lockId;


        if (keyId === undefined || lockId === undefined) {
            reject(_env.ErrorHandler.returnError(6001));
        }

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            reject(_env.ErrorHandler.returnError(4006));
        }

        _env.debug(METHOD_NAME, 'Searching User by KeyId');

        return resolve(dbDriver.findUser({'key.id': keyId}).toArray().then((_user) => {
                let user = _user[0];


                if (!user) {
                    //reject... requestor does not exist
                    _env.debug(METHOD_NAME, 'user with keyId does not exist');
                }

                let key = user.key;

                if (!key) {
                    //reject... user has no key
                    _env.debug(METHOD_NAME, 'user has no key');
                }

                //check masterkeys of doorlock
                

                _env.debug(METHOD_NAME, 'Searching Access');

                return dbDriver.findAccessByKeyId(keyId).toArray().then((_access) => {
                    let access = _access[0];

                    if (access === undefined || _access.length === 0) {
                        //throw error no access found
                        _env.debug(METHOD_NAME, 'no Access found');
                    } else {
                        _env.debug(METHOD_NAME, 'found Access');
                    }

                    //is the user authorized?
                    res = _env.contains(access.doorlockIds, lockId);

                    if (res) {
                        _env.debug(METHOD_NAME, `${lockId} Access Granted! ${JSON.stringify(key)}`);
                    } else {
                        _env.debug(METHOD_NAME, `${lockId} Access Denied! ${JSON.stringify(key)}`);
                    }

                    _env.debug(METHOD_NAME, 'Done');

                    return res;
                });

            },
            (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            }));
    })
};