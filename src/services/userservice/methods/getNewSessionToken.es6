'use strict';

import Promise from 'promise';
import crypto from 'crypto';

const METHOD_NAME = 'UserService/getNewSessionToken';

let db;
let SimpleResponse;
let SessionToken;

function generateSessionId() {
    const randomData = crypto.randomBytes(512);

    let hash = crypto.createHash('sha512');
    hash.update(randomData);
    return hash.digest('hex');
}

module.exports = {
    setup: (_env) => {
        SessionToken = _env.ObjectFactory.get('SessionToken');
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        const lifetime = parseInt(_args.lifetime);
        if (lifetime < 0) {
            reject({code: 'client', string: 'Lifetime is not valid'});
        }

        let session = _env.sessionmanager.getSessionOfSocket(_ws);

        if (session === undefined) {
            reject(_env.ErrorHandler.returnError(4002));
            return;
        }

        let hash = generateSessionId();

        let token = new SessionToken({
            sessionToken: hash,
            created: Date.now().toString()
        });

        if (lifetime > 0) {
            token.validUntil = parseInt(Date.now().toString()) + lifetime;
        }

        db.insertSessionToken(session, token.toJSON()).then(
            (_result) => {
                _env.debug(METHOD_NAME, _result);
            },
            (_error) => {
                _env.error(METHOD_NAME, _error);
            }
        );

        resolve(hash);

    })
};