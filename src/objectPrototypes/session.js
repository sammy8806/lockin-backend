'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Session extends ObjectPrototype {
    constructor(_session, _env) {
        const _whitelistedAttributes = null;
        super(_session, _whitelistedAttributes);

        this._env = _env;
    }

    onConnectionClosed() {
        const tag = 'Object/Session.onConnectionClosed';
        const oldStatus = this.connectionState;
        const newStatus = 'closed';

        global._env.debug(tag, 'Setting status from ' + oldStatus + ' to ' + newStatus);

        global._env.GlobalServiceFactory.getService('DatabaseService').getDriver()
            .setSessionStatus(this, newStatus).then((_res) => {
                global._env.debug(tag, 'Success');
            }, (_res) => {
                global._env.debug(tag, 'Failed: ' + _res);
            }
        );
    }
};
