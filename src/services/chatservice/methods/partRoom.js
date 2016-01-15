'use strict';

const METHOD_NAME = 'ChatService/partRoom';

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

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        const userId = _env.sessionmanager.getSessionOfSocket(_ws).userId;
        const roomId = _args.room;

        _env.log(METHOD_NAME, `User: ${userId}`);
        _env.log(METHOD_NAME, `Room: ${userId}`);

        resolve(db.removeUserFromRoom({id: roomId}, {_id: userId})
            .then((_success) => {
                _env.debug(METHOD_NAME, `Result: ${JSON.stringify(_success)}`);

                if (_success.result.nModified > 0) {
                    return new SimpleResponse({success: true});
                } else {
                    throw {code: 'client', string: 'user cannot be removed'};
                }
            })
        );
    })
};
