'use strict';
module.exports = class ObjectPrototype {
    constructor(_obj, _whitelistedAttributes) {
        this._whitelistedAttributes = _whitelistedAttributes;
        this.copyAttributes(_obj, this, this._whitelistedAttributes);
    }

    toJSON() {
        let attribs = {};
        this.copyAttributes(this, attribs, this._whitelistedAttributes);
        return attribs;
    }

    copyAttributes(_src, _target, _whitelist) {
        _whitelist.forEach(
            (_name) => {
                if (_src[_name] !== undefined) {
                    _target[_name] = _src[_name];
                }
            }
        );
    }
};
