'use strict';

const privateData = new WeakMap();
class User {
    constructor(mail, password) {
        privateData.set(this, {mail: mail, password: password});
    }

    getMail() {
        return privateData.get(this).mail;
    }

    hasPassword(password) {
        return privateData.get(this).password == password;
    }
}

class UserFactory {
    constructor() {
        privateData.set(this, {userdata: new Map()});
        this.users = privateData.get(this).userdata;
    }

    register(mail, password) {
        this.users.set(mail, new User(mail, password));
    }

    auth(mail, password) {
        const user = this.users.get(mail);
        if (user == undefined)
            return false;

        return user.hasPassword(password)
    }
}

const UF = new UserFactory();
UF.register('test@test.de', 'test123');
UF.register('baum@test.de', 'test');

const auth_1 = UF.auth('hallo@hallo.de', 'hallo');
const auth_2 = UF.auth('test@test.de', 'test123');

setInterval(function() {
    console.log('user1: ', auth_1);
    console.log('user2: ', auth_2);
}, 1000);
