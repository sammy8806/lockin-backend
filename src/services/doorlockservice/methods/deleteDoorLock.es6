'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/removeDoorLock';

let db;
let SimpleResponse;

module.exports = {
    parameterVariations: [
        {
            id: 'exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if (session === undefined) {
            //not logged in -> access denied
            reject(_env.ErrorHandler.returnError(4005))
        }

        let id = _args.id;

        _env.debug(METHOD_NAME, `Removing doorlock from database`);

        resolve(db.removeDoorLock(id).then(() => {
            return new SimpleResponse({success: true});
        }));
    })
};