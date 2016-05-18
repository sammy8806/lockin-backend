'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Access extends ObjectPrototype {
    constructor(_access) {
        const _whitelistedAttributes = [
            'id',
            'keyId',
            'doorLockIds',
            'requestorId',
            'timeStart',
            'timeEnd'
        ];

        super(_access, _whitelistedAttributes);
    }
};
