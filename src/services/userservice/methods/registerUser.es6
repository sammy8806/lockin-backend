'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/Register';

let db;
let Session;
let User;
let SimpleResponse;

module.exports = {
    parameterVariations: [
        {
            password: 'exists',
            email: 'exists',
            key: '!exists',
            id: '!exists',
            accesslist: '!exists',
            doorlocklist: '!exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let email = _args.email;
        let password = _args.password;

        _env.debug(METHOD_NAME, `Creating User '${email}' with Hash '${password}'`);

        // Benutzer anhand der E-Mail suchen
        resolve(db.findUser({email: email}).toArray()
            .then(function (user) {
                if (user.length === 0) { // Kein Benutzer gefunden
                    _env.debug(METHOD_NAME, 'No old user found');

                    // neuen benutzer mit email, passworthash und session(?) anlegen
                    let newUser = new User({email: email, password: password});

                    _env.debug(METHOD_NAME, `Creating new User ${newUser.email} with password: '${newUser.password}'`);

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