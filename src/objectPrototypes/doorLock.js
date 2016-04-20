'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class DoorLock extends ObjectPrototype {
    constructor(_doorLock) {
        const _whitelistedAttributes = [
            '_id',
            'name',
            'state'
        ];

        super(_doorLock, _whitelistedAttributes);
    }
};
