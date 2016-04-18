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
        },
        {
            name: 'exists',
            password: 'exists',
            email: '!exists',
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
            reject({code: 'server', string: 'internal error'});
        }

        if (User.isLoggedIn(_ws)) {
            reject({code: 'client', string: 'already logged in'});
            return;
        }

        _env.debug(METHOD_NAME, `Searching User with ${JSON.stringify(_args)}`);
        let res = new SimpleResponse({success: false});

        resolve(dbDriver.findUser({'$or' : [{email: _args.email}, {name: _args.name}]}).toArray()
            .then((_user) => {
                    _env.debug(METHOD_NAME, `Search done. ${_user.length} results found.`);
                    _env.debug(METHOD_NAME, JSON.stringify(_user));

                    let user;

                    user = _user[0]; // Use always the first one

                    if (user === undefined || _user.length === 0) {
                        let err = {code: 'client', string: 'user not found'};
                        throw err;
                    }

                    if (user === undefined) {
                        console.trace('User seems to be corrupt!', typeof user, user);
                    }

                    if (_args.password !== user.password) {
                        let err = {code: 'client', string: 'wrong password'};
                        throw err;
                    }

                    _env.debug(METHOD_NAME, 'Checks done');

                    let sessionId;

                    // session id erzeugen
                    sessionId = generateSessionId();

                    let session = new Session({sessionId: sessionId, userId: user._id}, _env);

                    // session id hinzufügen
                    dbDriver.newSession(session, user).then(
                        () => {
                            // session im user speichern
                            dbDriver.userAddSession(user, session);

                            _env.sessionmanager.addSocketSession(_ws, session);
                            dbDriver.setSessionStatus(session, 'online');

                            _env.debug(METHOD_NAME, 'Online status set');
                        }
                    );

                    res.success = true;

                    _env.debug(METHOD_NAME, 'Done');

                    return res;
                },
                (_err) => {
                    reject({code: 'server', string: _err});
                    console.log(_err);
                })
        );
    })
};
