'use strict';

const METHOD_NAME = 'ChatService/removeUserFromRoom';

let db;
let Session;
let User;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        User = _env.ObjectFactory.get('User');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) =>
        db.removeUserFromRoom({id: _args.room}, {_id: _args.user})
            .then((_success) => {
                _env.debug(METHOD_NAME, `Result: ${JSON.stringify(_success)}`);

                if (_success.result.nModified > 0) {
                    return new SimpleResponse({success: true});
                } else {
                    throw {code: 'client', string: 'user cannot be removed'};
                }
            })
};
