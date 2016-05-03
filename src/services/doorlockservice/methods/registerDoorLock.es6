'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/registerDoorLock';

let db;
let DoorLock;

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
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if (session === undefined) {
            //not logged in -> access denied
            reject(_env.ErrorHandler.returnError(4005))
        }

        let id = _args.id;
        let name = _args.name;
        let masterKeys = _args.masterKeys;
        let state = _args.state;

        let newDoorLock = new DoorLock({
            id: id,
            name: name,
            masterKeys: masterKeys,
            state: state
        });

        _env.debug(METHOD_NAME, `Saving doorlock to database`);

        resolve(db.insertDoorLock(newDoorLock).then(() => {
            return newDoorLock.toJSON();
        }));
    })
};