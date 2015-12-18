'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class SimpleResponse extends ObjectPrototype {
    constructor(_simpleResponse) {
        const _whitelistedAttributes = [
            'success'
        ];

        super(_simpleResponse, _whitelistedAttributes);
    }
};