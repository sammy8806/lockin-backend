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
};
