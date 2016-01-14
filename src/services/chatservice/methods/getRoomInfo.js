'use strict';

const METHOD_NAME = 'ChatService/getRoomInfo';

let db;
let Room;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        Room = _env.ObjectFactory.get('Room');
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => db.findRoom({id: _args.room}).toArray().then((room) => (new Room(room)))
};
