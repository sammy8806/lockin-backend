'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Room extends ObjectPrototype {
    constructor(_room) {
        const _whitelistedAttributes = [
            'id',
            'name',
            'description',
            'avatar',
            'userList',
            'defaultRole',
            'passwordHash',
            'location',
            'radius'
        ];

        super(_room, _whitelistedAttributes);

        // default default role maybe delete later
        this.defaultRole = "member";
    }
};
