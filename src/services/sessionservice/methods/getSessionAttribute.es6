'use strict';

import Promise from 'promise';

const METHOD_NAME = 'SessionService/setSessionAttribute';

let db;
let SimpleResponse;
let Session;
let SessionManager;

module.exports = {
    parameterVariations: [
        {
            attribute: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        SessionManager = _env.sessionmanager;
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        const attribute = _args.attribute;
        const defaultValue = _args.default;

        // session von websocket aus SessionManager holen
        let rawSession = SessionManager.getSessionOfSocket(_ws);

        if (rawSession === undefined) {
            _env.error(METHOD_NAME, 'No Session found!');
            reject(_env.ErrorHandler.returnError(4009));
            return;
        }

        /** @var session Session */
        let session = new Session(rawSession);
        session.getAttribute(attribute, defaultValue).then((_attrib) => {
            let ret = {};
            ret[attribute] = _attrib;

            resolve(ret);
        });
    })
};