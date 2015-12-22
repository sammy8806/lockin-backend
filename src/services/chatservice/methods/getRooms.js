'use strict';

module.exports = {
    call : (_args, _env, _ws, _type) => {

        const Room = _env.ObjectFactory.get('Room');
        let tmpRoomList = _env.ServiceFactory.getService('ChatService').tmpRoomList;

        return tmpRoomList;

    }
};
