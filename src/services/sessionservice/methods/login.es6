'use strict';

const crypto = require('crypto');
const Promise = require('promise');

const METHOD_NAME = 'SessionService/Login';

let db;
let Session;

function generateSessionId() {
    const randomData = crypto.randomBytes(256);

    let hash = crypto.createHash('sha256');
    hash.update(randomData);
    return hash.digest('hex');
}

module.exports = {
    setup: (_env) => {
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        const SimpleResponse = _env.ObjectFactory.get('SimpleResponse');

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            reject ({code: 'server', string: 'internal error'});
        }

        _env.debug(METHOD_NAME, 'Searching User');

        let user = dbDriver.findUser({email: _args.email}); // user anhand der email suchen

        return user.then(function (_arg) {
            _env.debug(METHOD_NAME, 'Search done');
            console.log(_arg);

            user = _arg[0]; // Use always the first one
            let res = new SimpleResponse({success: false});

            if (user !== undefined) {
                _env.debug(METHOD_NAME, '1 true');

                console.log(_args, user);

                if (_args.passwordHash === user.passwordHash) {
                    _env.debug(METHOD_NAME, '2 true');

                    let prevSession;
                    let sessionId;

                    do {
                        // session id erzeugen
                        sessionId = generateSessionId();

                        // prüfen ob diese bereits vorhanden ist (sonst neu erzugen)
                        prevSession = dbDriver.findSessionId(sessionId);
                    } while (prevSession !== undefined);

                    // session id hinzufügen
                    dbDriver.newSession(new Session({_id: sessionId}));

                    // session im user speichern
                    // user.sessions.push()

                    res.success = true;
                } else {
                    _env.debug(METHOD_NAME, '2 false');
                    resolve({code: 'client', string: 'wrong password'});
                }
            } else {
                _env.debug(METHOD_NAME, '1 false');
                reject({code: 'client', string: 'user not found'});
            }

            resolve(res);
        }).catch((err) => {
            console.log(err);
        });
    })
};

