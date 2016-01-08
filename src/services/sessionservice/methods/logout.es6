'use strict';

import Promise from 'promise';

const METHOD_NAME = 'SessionService/Logout';

let db;
let Session;
let SimpleResponse;
let sessionmanager;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService');
        sessionmanager = _env.sessionmanager;
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let res = new SimpleResponse({success: false});

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            reject({code: 'server', string: 'internal error'});
        }

        // session von websocket aus sessionmanager holen
        let session = sessionmanager.getSessionOfSocket(_ws);

        if(session === undefined) {
            reject({code: 'client', string: 'please login first'});
        }

        // user anhand der session in der datenbank finden
        return dbDriver.findUser({sessionId: session.sessionId}).limit(1).toArray().then(function (user) {

            if (user.length === 0) {
                // Kein Benutzer gefunden
                reject({code: 'server', string: 'active session not found in user'});
            } else {
                user = user[0];
            }

            // session in user aus datenbank entfernen
            dbDriver.userDeleteSession(user, session);

            // session aus datenbank entfernen
            dbDriver.endSession(session);

            _env.debug(METHOD_NAME, '-------------------------------');
            _env.debug(METHOD_NAME, 'Simply closing websocket here!!');
            _env.debug(METHOD_NAME, '-------------------------------');

            // session aus sessionmanager entfernen und websocket schließen
            _ws.close();

            res.success = true;
            resolve(res);
        });
    })
};
