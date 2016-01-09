'use strict';

const ObjectPrototype = require('./_objectPrototype');

module.exports = class User extends ObjectPrototype {
    constructor(_user) {
        const _whitelistedAttributes = [
            '_id',
            'id',
            'mail',
            'username',
            'displayname',
            'avatar',
            'password'
        ];

        super(_user, _whitelistedAttributes);

        if (_user._id !== undefined) {
            this.id = _user._id;
        }
    }

    static isLoggedIn(_ws) {
        // session von websocket aus sessionmanager holen
        let session = global._env.sessionmanager.getSessionOfSocket(_ws);
        return session !== undefined && session.userId !== undefined;
    }

    /**
     *
     * @param _ws
     * @param _db
     * @returns {*}
     */
    static getLoggedIn(_ws, _db) {
        // session von websocket aus sessionmanager holen
        let session = global._env.sessionmanager.getSessionOfSocket(_ws);

        if (session === undefined) {
            return false;
        }

        return User.newFromDatabase({_id: session.userId}, _db);
    }

    /**
     *
     * @param _user
     * @param _db
     * @returns {Promise.<T>}
     */
    static newFromDatabase(_user, _db) {
        return _db.findUser(_user).toArray().then(
            (_user) => {
                return new User(_user[0]);
            }
        );
    }
};
