'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/addAccessOrRequest';

let db;
let SimpleResponse;
let Access;
let User;

module.exports = {
    parameterVariations: [
        {
            id: '!exists',
            keyId: '!exists',
            doorLockIds: 'exists',
            requestorId: 'exists',
            timeStart: 'exists',
            timeEnd: 'exists',
            type: 'exists',
            buildingId: 'exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Access = _env.ObjectFactory.get('Access');
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            _env.ErrorHandler.throwError(4005);
        }


        resolve(User.getLoggedIn(_ws, db)
            .then((_user) => {

                _env.debug(METHOD_NAME, JSON.stringify(_user));

                let id = _env.random(10);

                //check if access with id already exists
                return db.findAccess({id: id}).toArray().then((_accesses) => {
                    if (_accesses.length > 0) {
                        _env.ErrorHandler.throwError(6005);
                    }

                    //check if doorlockIds exist
                    _env.debug(METHOD_NAME, 'Checking if doorlocks exists');
                    let doorlockIds = _args.doorLockIds;

                    return db.findDoorLocksByIds(_args.doorLockIds).toArray().then((_doorLocks) => {
                        if (_doorLocks.length < doorlockIds.length) {
                            _env.debug(METHOD_NAME, 'One or more doorlocks not found');
                            _env.ErrorHandler.throwError(6002);
                        }

                        //check if building exists
                        _env.debug(METHOD_NAME, 'Checking if building exists');
                        return db.findBuilding({_id: _args.buildingId}).then((_buildings) => {

                            if (_buildings === undefined || _buildings.length === 0) {
                                _env.debug(METHOD_NAME, 'Building with ' + _args.buildingId + ' not found');
                                _env.ErrorHandler.throwError(8003);
                            }

                            let newAccess = new Access(_args);

                            newAccess.id = id;

                            // store dates as dateobjects
                            newAccess.timeStart = new Date(_args.timeStart);
                            newAccess.timeEnd = new Date(_args.timeEnd);

                            //add owner-Key-id from logged in user to access-object
                            newAccess.keyId = _user.key.id;

                            _env.debug(METHOD_NAME, `Saving access to database`);

                            return db.insertAccess(newAccess).then(() => {
                                return new SimpleResponse({success: true});
                            });
                        });
                    });
                });
            }),
            (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            }
        );


    })
};