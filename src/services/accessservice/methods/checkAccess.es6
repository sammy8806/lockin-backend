'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/checkAccess';

let db;

module.exports = {
    parameterVariations: [
        {
            key: 'exists',
            lockId: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },
    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if (session === undefined) {
            reject(_env.ErrorHandler.returnError(4005));
        }

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

            return db.findAccess({keyId: keyId}).toArray().then((_access) => {
                let res = false;

                let access = _access[0];

                if (access === undefined || _access.length === 0) {
                    //throw error no access found
                    _env.debug(METHOD_NAME, 'no Access found');
                    _env.ErrorHandler.throwError(6003);
                } else {
                    _env.debug(METHOD_NAME, 'found Access');
                }

                _env.debug(METHOD_NAME, 'Checking access time');

                let now = new Date();

                let start = Date.parse(access.timeStart);
                let end = Date.parse(access.timeEnd);

                let accessValid = now >= start && now <= end;

                if (accessValid) {
                    _env.debug(METHOD_NAME, 'Access time valid');
                } else {
                    _env.debug(METHOD_NAME, 'Access time invalid');
                }

                //is the user authorized?
                res = _env.contains(access.doorlockIds, lockId) && accessValid;

                if (res) {
                    _env.debug(METHOD_NAME, `${lockId} Access Granted! ${keyId}`);
                } else {
                    _env.debug(METHOD_NAME, `${lockId} Access Denied! ${keyId}`);
                }

                _env.debug(METHOD_NAME, 'Done');

                return res;
            });
        }))
    })
};