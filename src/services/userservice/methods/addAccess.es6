'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/addAccess';

let db;
let SimpleResponse;
let Access;

module.exports = {
    parameterVariations: [
        {
            id: 'exists',
            keyId: 'exists',
            doorlockIds: 'exists',
            requestorId: 'exists',
            timeStart: 'exists',
            timeEnd: 'exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Access = _env.ObjectFactory.get('Access');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        //check if logged in   
        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if (session === undefined) {
            //not logged in -> access denied
            reject(_env.ErrorHandler.returnError(4005))
        }

        //check if access with id already exists
        resolve(db.findAccess({id: _args.id}).toArray().then((_accesses) => {
            if (_accesses.length > 0) {
                _env.ErrorHandler.throwError(6005);
            }

            //check if doorlockIds exist
            let doorlockIds = _args.doorlockIds;

            return db.findDoorLocksByIds(_args.doorlockIds).toArray().then((_doorLocks) => {
                if (_doorLocks.length < doorlockIds.length) {
                    _env.debug(METHOD_NAME, 'One or more doorlocks not found');
                    _env.ErrorHandler.throwError(6002);
                }

                let newAccess = new Access(_args);

                _env.debug(METHOD_NAME, `Saving access to database`);

                return db.insertAccess(newAccess).then(() => {
                    return new SimpleResponse({success: true});
                });
            });
        }));
    })
};