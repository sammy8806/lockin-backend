'use strict';

module.exports = {
    call : login
};

const SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
const User = _env.ObjectFactory.get('User');

console.log(login({ email : "peter@parker", passwordHash : "abc" }));

function login(_args, _env) {
    let res = new SimpleResponse({success: false});

    //let user = db.find(_args.email); // user anhand der email suchen

    let user = new User();

    console.log(user.mail);

    if (user != null) {
        if (_args.passwordHash === user.passwordHash) {
            // user einloggen???
            res.success = true;
        } else {
            throw { code: 'client', text: 'wrong password' };
        }
    } else {
        throw { code: 'client', text: 'user not found' };
    }

    return res.success;
}