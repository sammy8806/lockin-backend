'use strict';

const METHOD_NAME = 'ChatService/getRooms';

let db;
let Session;
let User;
let Room;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        User = _env.ObjectFactory.get('User');
        Room = _env.ObjectFactory.get('Room');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let user = User.getLoggedIn(_ws, db);

        if (user === false) {
            reject({code: 'client', string: 'please login first'});
            return;
        }

        resolve(user.then((_user) => {
            _env.debug(METHOD_NAME, `Logged-in user ${_user.id}`);

            return db.findRoom({'userList.id': _user.id}).toArray()
                .then((_rooms) => {

                    _env.debug(METHOD_NAME, `Rooms found: ${_rooms.length}`);
                    let rooms = [];

                    _rooms.forEach((_r) => {
                        _env.debug(METHOD_NAME, `Rooms ${_r.id}`);
                        rooms.push(new Room(_r).toJSON());
                    });

                    return rooms;
                });
        }));

    })
};
