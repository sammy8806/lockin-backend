'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Message extends ObjectPrototype {
    constructor(_room) {
        const _whitelistedAttributes = [
            'id',
            'from',
            'to',
            'date',
            'type',
            'data'
        ];

        super(_room, _whitelistedAttributes);
    }
};
