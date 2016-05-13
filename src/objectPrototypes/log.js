'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Log extends ObjectPrototype {
    constructor(_log) {
        const _whitelistedAttributes = [
            'id',
            'requestorId',
            'lockId',
            'ownerId',
            'timestamp',
            'actionState'
        ];

        super(_log, _whitelistedAttributes);
    }
};
