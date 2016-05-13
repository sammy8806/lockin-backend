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
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        sessionmanager = _env.sessionmanager;
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let res = new SimpleResponse({success: false});

        // session von websocket aus sessionmanager holen
        let session = sessionmanager.getSessionOfSocket(_ws);

        if (session === undefined) {
            _env.error(METHOD_NAME, 'No Session found!');
            reject(_env.ErrorHandler.returnError(4009));
            return;
        }

        // user anhand der session in der datenbank finden
        let ret = db.findUser({'session': session.sessionId}).toArray()
            .then(function (user) {
                if (user.length === 0) {
                    // Kein Benutzer gefunden
                    _env.error(METHOD_NAME, 'No User found!');
                    reject(_env.ErrorHandler.returnError(4002));
                }

                session.endSession();

                // session aus sessionmanager entfernen
                _env.sessionmanager.socketClosed(_ws);

                res.success = true;
                return res;
            });

        resolve(ret);
    })
};
