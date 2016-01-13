'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class SessionToken extends ObjectPrototype {
    constructor(_room) {
        const _whitelistedAttributes = [
            'sessionToken',
            'created',
            'validUntil'
        ];

        super(_room, _whitelistedAttributes);
    }
};
