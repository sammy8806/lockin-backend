'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/GetUserInfo';

let db;
let User;
let DoorLock;
let Access;

module.exports = {
    parameterVariations: [
        {}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        DoorLock = _env.ObjectFactory.get('DoorLock');
        Access = _env.ObjectFactory.get('Access');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        let user;

        resolve(User.getLoggedIn(_ws, db)
            .then((_user) => {
                user = _user;

                if (user === undefined) {
                    _env.ErrorHandler.throwError(3008);
                }

                _env.debug(METHOD_NAME, JSON.stringify(user));

                if (user._id !== undefined) {
                    delete user._id;
                }
                if (user.password !== undefined) {
                    delete user.password;
                }

                //add Doorlocks of user to user object
                return db.findDoorLock({keyId: user.key.id}).toArray()
                    .then((_doorLocks)=> {
                        if (_doorLocks.length === 0) {
                            _env.debug(METHOD_NAME, 'no Doorlocks found');
                        }

                        let doorLocks = [];

                        for (let i = 0; i < _doorLocks.length; i++) {
                            doorLocks[i] = new DoorLock(_doorLocks[i]).toJSON();
                        }

                        user.doorLocks = doorLocks;

                        //add Accesses the user created to user object
                        return db.findAccess({keyId: user.key.id}).toArray()
                            .then((_accesses) => {
                                if (_accesses.length === 0) {
                                    _env.debug(METHOD_NAME, 'no Accesses found');
                                }

                                let accesses = [];

                                for (let i = 0; i < _accesses.length; i++) {
                                    accesses[i] = new Access(_accesses[i]).toJSON();
                                }

                                user.accesslist = accesses;

                                return user;
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