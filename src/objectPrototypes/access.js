'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Access extends ObjectPrototype {
    constructor(_access) {
        const _whitelistedAttributes = [
            '_id',
            'key',
            'requestor_id',
            'time_start',
            'time_end',
            'state'
        ];

        super(_access, _whitelistedAttributes);
    }
};
