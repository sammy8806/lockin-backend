/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const __METHOD_NAME = 'ChatService/createRoom';

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

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        const randomData = crypto.randomBytes(256);

        let hash = crypto.createHash('sha256');
        hash.update(randomData);
        const roomId = hash.digest('hex');

        const room = new Room({id: roomId});
        db.createRoom(room.toJSON());

        resolve(room);
    })
};
