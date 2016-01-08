'use strict';

import crypto from 'crypto';

const METHOD_NAME = 'SessionService/Login';

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

        // session von websocket aus sessionmanager holen
        //if (global._env.sessionmanager.getSessionOfSocket(_ws) !== undefined) {
        //    reject({code: 'client', string: 'already logged in'});
        //}

        if (User.isLoggedIn(_ws)) {
            reject({code: 'client', string: 'already logged in'});
            return;
        }

        _env.debug(METHOD_NAME, 'Searching User');
        let res = new SimpleResponse({success: false});

        resolve(dbDriver.findUser({mail: _args.mail}).toArray()
            .then((_user) => {
                    _env.debug(METHOD_NAME, `Search done. ${_user.length} results found.`);

                    let user;

                    user = _user[0]; // Use always the first one

                    if (user === undefined || _user.length === 0) {
                        let err = {code: 'client', string: 'user not found'};
                        throw err;
                    }

                    if (user === undefined) {
                        console.trace('User seems to be corrupt!', typeof user, user);
                    }

                    if (_args.passwordHash !== user.passwordHash) {
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
