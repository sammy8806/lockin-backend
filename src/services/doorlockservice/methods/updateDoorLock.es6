'use strict';

import Promise from 'promise';

const METHOD_NAME = 'DoorLockService/updateDoorLock';

let db;
let SimpleResponse;
let User;
let DoorLock;

module.exports = {
    parameterVariations: [
        {
            'id': 'exists'
        }
    ],
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        DoorLock = _env.ObjectFactory.get('DoorLock');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(3008));
        }

        if(_args.id === undefined) {
            _env.debug(METHOD_NAME, 'ID for Update was not provided');
            reject(_env.ErrorHandler.returnError(3008));
        }

        let res = new SimpleResponse({success: false});
        let doorLock = new DoorLock(_args);
        let doorLockId = doorLock.id;

        if(doorLock.length === 0) {
            _env.debug(METHOD_NAME, 'Not enough Parameters to Update');
            reject(_env.ErrorHandler.returnError(3008));
        }

        resolve(db.updateDoorLock({id: doorLockId}, doorLock.toJSON()).then(
            () => {
                res.success = true;
                return res;
            }, (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            })
        );
    })
};