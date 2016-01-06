/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const __METHOD_NAME = 'createRoom';

const crypto = require('crypto');

module.exports = {
    call: (_args, _env, _ws, _type) => {
        try {
            const Room = _env.ObjectFactory.get('Room');
            let tmpRoomList = _env.ServiceFactory.getService('ChatService').tmpRoomList;

            try {
                _env.websockethandler.sendMessage(
                    _ws,
                    _env.packetParser.buildRequest('JSONWSP', 'servicenamehere', 'methodnamehere', {}, 'mirrorhere')
                );
            }
            catch (err) {
                console.log(err);
            }

            const randomData = crypto.randomBytes(256);

            let hash = crypto.createHash('sha256');
            hash.update(randomData);
            const roomId = hash.digest('hex');

            const room = new Room({id: roomId});
            tmpRoomList[roomId] = room;

            return room;
        } catch (e) {
            _env.error(__METHOD_NAME, e);
        }
    }
};
