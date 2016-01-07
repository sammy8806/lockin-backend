'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/Register';

let db;
let Session;
let User;
let sessionmanager;

module.exports = {
    setup: (_env) => {
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService');
        User = _env.ObjectFactory.get('User');
        sessionmanager = _env.sessionmanager;
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let dbDriver = null;
        try {
            dbDriver = db.getDriver();
        } catch (e) {
            _env.error(METHOD_NAME, 'Please setup this function first!');
            reject({code: 'server', string: 'internal error'});
        }

        // Benutzer anhand der E-Mail suchen
        dbDriver.findUser({mail: _args[0]}).then(function (user) {

            if (user.length == 0) { // Kein Benutzer gefunden

                // session vom websocket holen
                let session = sessionmanager.getSessionOfSocket(_ws);

                // neuen benutzer mit email, passworthash und session(?) anlegen
                let newUser = new User({mail: _args[0], passwordHash: _args[1]});

                // user in datenbank speichern
                dbDriver.insertUser(newUser);

                // user zurückgeben
                resolve(newUser);

            } else if (user.length > 0) { // Benutzer bereits vorhanden
                reject({code: 'client', string: 'email already registered'});
            } else { // Sonstiger fehler
                reject({code: 'server', string: 'unknown error'});
            }
        });
    })
};