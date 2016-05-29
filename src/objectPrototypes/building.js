'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Building extends ObjectPrototype {
    constructor(_building) {
        const _whitelistedAttributes = [
            'id',
            'name',
            'keyId', //KeyId of creator
            'street',
            'houseNumber',
            'zipCode',
            'town',
            'floors'
        ];

        super(_building, _whitelistedAttributes);

        if (_building._id !== undefined) {
            this.id = _building._id;
        }
    }
};
