'use strict';
module.exports = class ObjectPrototype {
    constructor(_obj, _whitelistedAttributes) {
        const keys = Object.keys(_obj);

        if (keys.length == 0)
            return;

        for (let it = 0; it < keys.length; it++) {
            const key = keys[it];

            if (this._whitelistedAttributes[key] !== undefined) {
                this[key] = _obj[key];
            }
        }
    }
};
