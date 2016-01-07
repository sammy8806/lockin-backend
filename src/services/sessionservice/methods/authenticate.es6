'use strict';

import Promise from 'promise';
const METHOD_NAME = 'SessionService/Authenticate';

let db;
let Session;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => {
        let res = new SimpleResponse({success: false});

        return new Promise((resolve, reject) => {
            return db.findSessionToken(_args.sessionToken)
                .then((_sessionId) => {
                    return db.findSession({sessionId: _sessionId});
                }, (_err) => {
                    console.error(_err);
                })
                .then((_session) => {
                    console.log(_session);

                    _session = _session[0];

                    console.log(_session);

                    _env.sessionmanager.addSocketSession(_ws, _session);
                    db.setSessionStatus({sessionId: _session.sessionId}, 'online');
                    res.success = true;

                    resolve(res);
                }, (_err) => {
                    console.error(_err);
                });

        });
    }
};
