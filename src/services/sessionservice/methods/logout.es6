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
            reject(_env.ErrorHandler.returnError(4008));
        }

        // session von websocket aus sessionmanager holen
        let session = sessionmanager.getSessionOfSocket(_ws);

        if(session === undefined) {
            reject(_env.ErrorHandler.returnError(4009));
            return;
        }

        // user anhand der session in der datenbank finden
        return dbDriver.findUser({'session': session.sessionId}).toArray().then(function (user) {

            if (user.length === 0) {
                // Kein Benutzer gefunden
                reject(_env.ErrorHandler.returnError(4002));
            } else {
                user = user[0];
            }

            session.endSession();

            // session aus sessionmanager entfernen
            _env.sessionmanager.socketClosed(_ws);

            res.success = true;
            return res;
        });
    })
};
