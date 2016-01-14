'use strict';

const METHOD_NAME = 'ChatService/deleteRoom';

const crypto = require('crypto');

let db;
let Room;
let Session;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        Room = _env.ObjectFactory.get('Room');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => db.findRoom({id: _args.room}).toArray()
        .then((_room) => {
            if (_room.length === 0) {
                throw {code: 'client', string: 'room not found'};
            } else {
                return _room[0];
            }
        })
        .then((_room) => {
            _env.debug(METHOD_NAME, `Deleting Room: ${_room}`);

            return db.removeRoom(_room);
        }).then((_success) => {
            _env.debug(METHOD_NAME, `Remove status: ${_success.result.ok}`);

            if (_success.result.ok === 1) {
                return new SimpleResponse({success: true});
            } else {
                throw {code: 'server', string: 'remove failed'};
            }
        })
};
