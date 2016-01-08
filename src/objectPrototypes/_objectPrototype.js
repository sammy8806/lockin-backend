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
        let from = _whitelist === null ? Object.keys(_src) : _whitelist;
        from.forEach(
            (_name) => {
                if (_src[_name] !== undefined && _name.substr(0, 1) !== '_') {
                    _target[_name] = _src[_name];
                }
            }
        );
    }
};
