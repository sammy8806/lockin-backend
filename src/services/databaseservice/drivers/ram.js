'use strict';

let _data, _dataExample;

_dataExample = {
    User: {
        _id: 'fpij4th430tzh430th49t',
        chats: [
            'test',
            'test2'
        ],
        sessions: [
            'niprwhpgr',
            'grniepogre'
        ]
    },

    Session: {
        device: '',
        via: '', // Device here
        connectionType: '',
        connectionState: '',
        lastMessage: ''
    },

    Chat: {
        users: {
            'fpi4th430tzh430th49t': {
                roles: [
                    'SingleChatClient'
                ],
                rights: [
                    'read',
                    'write'
                ]
            },
            'fgmn904vuzh89045u04fd': {}
        }
    },

    Role: {
        name: 'SingleChatClient',
        rights: [
            'read',
            'write',
            'invite'
        ]
    },

    Device: {
        name: 'Tablet123',
        client: 'Android v1',
        attributes: {
            gcmKey: ''
        }
    }

};

_data = {
    User: [],
    Session: [],
    Chat: [],
    Role: [],
    Device: []
};

let methods = {};

methods.findSessionId = function (_sessionId) {
    return _data.Session.find((_e, _idx, _arr) => _e._id === _sessionId);
};

methods.newSession = function (_session) {
    return !!_data.Session.push(_session);
};

methods.findUser = function (_attr) {
    return _data.User.find((_e, _idx, _arr) => {
        let success = true;

        Object.keys(_attr).forEach((_key) => {
            if (_e[_key] === _attr[_key]) {
                success = success && true;
            }
        });

        return success;
    });
};

module.exports = methods;
