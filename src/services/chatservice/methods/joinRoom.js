/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const METHOD_NAME = 'ChatService/joinRoom';

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

        const targetRoom = _args.room;
        _env.debug(METHOD_NAME, `Try to join room ${targetRoom}`);

        let user = User.getLoggedIn(_ws, db);

        if(user === false) {
            reject({code: 'client', string: 'please login first'});
            return;
        }

        resolve(user.then((_user) => {
            _env.debug(METHOD_NAME, `Logged-in user ${_user.id}`);

            return db.findRoom({id: targetRoom}).toArray()
                .then((_room) => {
                    _env.debug(METHOD_NAME, `Room ${_room[0].id}`);
                    return db.addUserToRoom(_room[0].id, _user.id);
                });
        }));

    })
};
