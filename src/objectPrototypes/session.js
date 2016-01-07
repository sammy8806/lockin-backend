'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Session extends ObjectPrototype {
    constructor(_session, _env) {
        const _whitelistedAttributes = null;
        super(_session, _whitelistedAttributes);

        this._env = _env;
    }

    onConnectionClosed() {
        let db = this._env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        db.setSessionStatus(this, 'closed');
    }
};
