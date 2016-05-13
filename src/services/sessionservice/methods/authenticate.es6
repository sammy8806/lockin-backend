'use strict';

const METHOD_NAME = 'SessionService/Authenticate';

let db;
let Session;
let SimpleResponse;

module.exports = {
    parameterVariations: [
        {
            sessionToken: 'exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => {
        let res = new SimpleResponse({success: false});

        return new Promise((resolve, reject) => {
            let result = db.findSessionByToken(_args.sessionToken).toArray()
                .then((_sessions) => {
                    if (_sessions.length === 0) {
                        _env.ErrorHandler.throwError(3001);
                    }

                    let _session = _sessions[0];

                    if (_session.logout !== undefined) {
                        _env.ErrorHandler.throwError(3009);
                    }

                    _env.sessionmanager.addSocketSession(_ws, new Session(_session));
                    db.setSessionStatus({sessionId: _session.sessionId}, 'online');
                    res.success = true;

                    return res;
                }, (_err) => {
                    throw _err;
                });

            resolve(result);
        });
    }
};
