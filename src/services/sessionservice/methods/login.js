'use strict';

module.exports = {
    call: (_args, _env, _ws, _type) => {
        const SimpleResponse = _env.ObjectFactory.get('SimpleResponse');

        let res = new SimpleResponse({success: false});
        //let user = db.find(_args.email); // user anhand der email suchen

        if (user != null) {
            if (_args.passwordHash === user.passwordHash) {

                // session id erzeugen
                // prüfen ob diese bereits vorhanden ist (sonst neu erzugen)
                // session id hinzufügen
                // session im user speichern

                res.success = true;
            } else {
                throw {code: 'client', text: 'wrong password'};
            }
        } else {
            throw {code: 'client', text: 'user not found'};
        }

        return res.success;
    }
};