'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class User extends ObjectPrototype {
    constructor(_user) {
        const _whitelistedAttributes = [
            'id',
            'mail',
            'username',
            'displayname',
            'avatar',
            'passwordHash'
        ];

        super(_user, _whitelistedAttributes);
    }

    static isLoggedIn(_ws) {
        // session von websocket aus sessionmanager holen
        let session = global._env.sessionmanager.getSessionOfSocket(_ws);

        if (session === undefined) {
            return false;
        }

        return !!session.userId;
    }
};
