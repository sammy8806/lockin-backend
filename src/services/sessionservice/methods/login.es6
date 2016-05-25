'use strict';

import crypto from 'crypto';

const METHOD_NAME = 'UserService/loginUser';

let db;
let Session;
let SimpleResponse;
let User;

function generateSessionId() {
    const randomData = crypto.randomBytes(256);

    let hash = crypto.createHash('sha256');
    hash.update(randomData);
    return hash.digest('hex');
}

module.exports = {
    parameterVariations: [
        {
            name: '!exists',
            password: 'exists',
            email: 'exists',
            key: '!exists',
            id: '!exists',
            accesslist: '!exists',
            doorlocklist: '!exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        User = _env.ObjectFactory.get('User');
        db = _env.GlobalServiceFactory.getService('DatabaseService');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            reject(_env.ErrorHandler.returnError(4006));
        }

        if (User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(3005));
            return;
        }

        _env.debug(METHOD_NAME, `Searching User with ${_args.email} * ${_args.password}`);
        let res = new SimpleResponse({success: false});

        resolve(dbDriver.findUser({email: _args.email}).toArray()
            .then((_user) => {
                    _env.debug(METHOD_NAME, `Search done. ${_user.length} results found.`);
                    _env.debug(METHOD_NAME, JSON.stringify(_user));

                    let user;

                    user = _user[0]; // Use always the first one

                    if (user === undefined || _user.length === 0) {
                        _env.ErrorHandler.throwError(3002);
                    }

                    if (user === undefined) {
                        console.trace('User seems to be corrupt!', typeof user, user);
                        _env.ErrorHandler.throwError(3006, 'Contact Serveradmin!');
                        return;
                    }

                    if (_args.password !== user.password) {
                        _env.ErrorHandler.throwError(3007);
                    }

                    _env.debug(METHOD_NAME, 'Checks done');

                    let sessionId;

                    // session id erzeugen
                    sessionId = generateSessionId();

                    let session = new Session({sessionId: sessionId, userId: user._id}, _env);

                    // session id hinzufügen
                    return dbDriver.newSession(session, user)
                        .then(
                            dbDriver.userAddSession(user, session)
                        )
                        .then(
                            () => {
                                _env.sessionmanager.addSocketSession(_ws, session);
                                return dbDriver.setSessionStatus(session, 'online');
                            }
                        )
                        .then(
                            _env.debug(METHOD_NAME, 'Online status set')
                        );
                },
                (_err) => {
                    reject({code: 'server', string: _err});
                    console.log(_err);
                }).then(
                () => {

                    res.success = true;

                    _env.debug(METHOD_NAME, 'Done');

                    return res;
                }
            )
        );
    })
};
