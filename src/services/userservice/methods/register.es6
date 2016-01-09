'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/Register';

let db;
let Session;
let User;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let mail = _args.mail;
        let passwordHash = _args.passwordHash;

        _env.debug(METHOD_NAME, `Creating User '${mail}' with Hash '${passwordHash}'`);

        // Benutzer anhand der E-Mail suchen
        resolve(db.findUser({mail: mail}).toArray()
            .then(function (user) {
                if (user.length === 0) { // Kein Benutzer gefunden
                    _env.debug(METHOD_NAME, 'No old user found');

                    // neuen benutzer mit email, passworthash und session(?) anlegen
                    let newUser = new User({mail: mail, password: passwordHash});

                    _env.debug(METHOD_NAME, 'Creating new User');

                    // user in datenbank speichern
                    return db.insertUser(newUser).then(() => {
                        let user = newUser;
                        user.password = undefined;
                        return user.toJSON();
                    });
                } else if (user.length > 0) { // Benutzer bereits vorhanden
                    throw {code: 'client', string: 'email already registered'};
                } else { // Sonstiger fehler
                    throw {code: 'server', string: 'unknown error'};
                }
            }, (_err) => {
                _env.error(METHOD_NAME, _err);
            })
        );
    })
};