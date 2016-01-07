'use strict';

import crypto from 'crypto';
import Promise from 'promise';

const METHOD_NAME = 'SessionService/Login';

let db;
let Session;
let SimpleResponse;

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

        _env.debug(METHOD_NAME, 'Searching User');

        let user = dbDriver.findUser({email: _args.email}); // user anhand der email suchen

        return user.then(function (_arg) {
            _env.debug(METHOD_NAME, 'Search done');

            user = _arg[0]; // Use always the first one
            let res = new SimpleResponse({success: false});

            if (user === undefined) {
                reject({code: 'client', string: 'user not found'});
            }

            if (_args.passwordHash !== user.passwordHash) {
                reject({code: 'client', string: 'wrong password'});
            }

            let sessionId;

            // session id erzeugen
            sessionId = generateSessionId();

            let session = new Session({sessionId: sessionId, userId: user._id}, _env);

            // session id hinzufügen
            return dbDriver
                .newSession(session, user)
                .then(
                    () => {
                        // session im user speichern
                        dbDriver.userAddSession(user, session);
                        _env.sessionmanager.addSocketSession(_ws, session);
                        dbDriver.setSessionStatus(session, 'online');

                        res.success = true;

                        _env.debug(METHOD_NAME, 'Done');

                        resolve(res);
                    },
                    (_err) => {
                        reject({code: 'server', string: _err});
                        console.log(_err);
                    })
                .catch((_err) => {
                    //console.log(_err);
                    reject({code: 'server', string: _err});
                });

        }).catch((err) => {
            console.log(err);
        });
    })
};
