'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/findAccess';

let db;
let User;
let Access;

module.exports = {
    parameterVariations: [
        {accessId: 'exists'},
        {requestorId: 'exists'},
        {doorLockIds: 'exists'},
        {keyId: 'exists'}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        Access = _env.ObjectFactory.get('Access');
    },
    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {


        let data = User.getLoggedIn(_ws, db)
            .then((_user) => {
                let args = Object.keys(_args);
                _env.debug(METHOD_NAME, 'Got: ' + JSON.stringify(args));
                let intersect = _env.arrayIntersect(args, ['accessId', 'requestorId', 'doorLockIds']);
                _env.debug(METHOD_NAME, 'Find: ' + JSON.stringify(intersect));

                if (intersect.length !== 1) {
                    _env.ErrorHandler.throwError(1006);
                }

                let search = {};
                search[intersect[0]] = _args[intersect[0]];

                _env.debug(METHOD_NAME, 'Search: ' + JSON.stringify(search));

                return db.findAccess(search).toArray().then(
                    (_accesses) => _accesses.map((_access) => {
                            let access = new Access(_access);
                            return access.toJSON();
                        }
                    )
                );
            });
        resolve(data);
    })
};