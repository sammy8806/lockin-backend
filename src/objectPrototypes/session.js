'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Session extends ObjectPrototype {
    constructor(_session) {
        const _whitelistedAttributes = [];
        super(_session, _whitelistedAttributes);
    }
};
