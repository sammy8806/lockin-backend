'use strict';

const METHOD_NAME = 'LogService/findLog';

let db;
let User;
let Session;
let SimpleResponse;
let Log;

module.exports = {
    parameterVariations: [
        {requestorId: 'exists'},
        {ownerId: 'exists'},
        {actionState: 'exists'},
        {date: 'exists'},
        {lockId: 'exists'}
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        User = _env.ObjectFactory.get('User');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Log = _env.ObjectFactory.get('Log');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        if (!User.isLoggedIn(_ws)) {
            _env.ErrorHandler.throwError(4005);
        }

        let data = User.getLoggedIn(_ws, db)
            .then((_user) => {
                let args = Object.keys(_args);
                _env.debug(METHOD_NAME, 'Got: ' + JSON.stringify(args));
                let intersect = _env.arrayIntersect(args, ['requestorId', 'ownerId', 'actionState', 'date', 'lockId']);
                _env.debug(METHOD_NAME, 'Find: ' + JSON.stringify(intersect));

                if (intersect.length !== 1) {
                    _env.ErrorHandler.throwError(1006);
                }

                let search = {};
                search[intersect[0]] = _args[intersect[0]];
                _env.debug(METHOD_NAME, 'Search: ' + JSON.stringify(search));

                return db.findLogEntry(search).then(
                    (_logEntrys) => _logEntrys.map((_entry) => {
                            let logEntry = new Log(_entry);
                            return logEntry.toJSON();
                        }
                    )
                );
            });
        resolve(data);
    })
};
