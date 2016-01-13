'use strict';

const METHOD_NAME = 'ChatService/setRoomInfo';

let db;
let Session;
let User;
let Room;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        Room = _env.ObjectFactory.get('Room');
        User = _env.ObjectFactory.get('User');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (_args.info === undefined || _args.info.id === undefined) {
            reject({code: 'client', string: 'missing required parameters'});
        }

        const targetRoom = _args.info.id;
        const roomInfo = _args.info;

        _env.debug(METHOD_NAME, `Try to set Info for Room: ${targetRoom}`);

        resolve(db.setRoomAttibutes({id: targetRoom}, roomInfo)
            .then((_status) => {
                _env.debug(METHOD_NAME, `Room update: ${_status.ok}`);
                return new SimpleResponse({success: true});
            })
        )
    })
};
