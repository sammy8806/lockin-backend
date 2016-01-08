'use strict';

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
            let result = db.findSessionToken(_args.sessionToken)
                .then((_sessionId) => {
                    let sId = _sessionId[0].sessionId;

                    _env.debug(METHOD_NAME, 'Token: ' + sId);
                    return db.findSession({sessionId: sId});

                }, (_err) => {
                    console.error(_err);
                    reject(_err);
                }).then((_session) => {
                    _session = _session[0];
                    _env.sessionmanager.addSocketSession(_ws, new Session(_session));
                    db.setSessionStatus({sessionId: _session.sessionId}, 'online');
                    res.success = true;

                    return res;
                }, (_err) => {
                    console.error(_err);
                    reject(_err);
                });

            resolve(result);
        });
    }
};
