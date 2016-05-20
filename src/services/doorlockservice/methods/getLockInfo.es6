'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/getLockInfo';

let db;
let DoorLock;

module.exports = {
    parameterVariations: [
        {
            id: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        DoorLock = _env.ObjectFactory.get('DoorLock');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        let user;

        resolve(
            db.findDoorLock({id: _args.id}).toArray()
                .then(
                    (_doorLocks) => new DoorLock(_doorLocks[0]).toJSON()
                )
        )
    })
};
