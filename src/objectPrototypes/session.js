'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class Session extends ObjectPrototype {
    constructor(_session, _env) {
        const _whitelistedAttributes = null;
        super(_session, _whitelistedAttributes);

        this._env = _env;
        this._ended = false;
        this._db = global._env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    }

    onConnectionClosed() {
        if (this._ended) {
            return;
        }

        this.setStatus('closed');
    }

    endSession() {
        this._ended = true;

        // session in user aus datenbank entfernen
        this._db.userDeleteSession(this.userId, this);

        // session aus datenbank entfernen
        this._db.endSession(this);

        this.setStatus('loggedOut');
    }

    setStatus(_status) {
        const tag = 'Object/Session.setStatus';
        global._env.debug(tag, 'Setting status from ' + this.connectionState + ' to ' + _status);

        return this._db.setSessionStatus(this, _status)
            .then(
                () => global._env.debug(tag, 'Success'),
                (_res) => global._env.debug(tag, 'Failed: ' + _res)
            );
    }

    setAttribute(_key, _value) {
        const tag = 'Object/Session.setAttribute';
        global._env.debug(tag, `Setting Attribute ${_key} to: ${_value}`);

        let attrib = {};
        attrib[_key] = _value;

        return this._db.setSessionAttribute(this, attrib)
            .then(
                () => global._env.debug(tag, 'Success'),
                (_res) => global._env.debug(tag, 'Failed: ' + _res)
            );
    }

    // TODO: setAttribute
    // TODO: getAttribute
};
