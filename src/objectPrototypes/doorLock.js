'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class DoorLock extends ObjectPrototype {
    constructor(_doorLock) {
        const _whitelistedAttributes = [
            'id',
            'name',
            'masterKeys',
            'state'
        ];

        super(_doorLock, _whitelistedAttributes);
    }
};
