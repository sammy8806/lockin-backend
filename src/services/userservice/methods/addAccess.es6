'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/addAccess';

let db;
let SimpleResponse;
let Access;

module.exports = {
    parameterVariations: [
        {
            id: 'exists',
            key: 'exists',
            requestor_id: 'exists',
            time_start: 'exists',
            time_end: 'exists',
            state: 'exists'
        }
    ],

    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Access = _env.ObjectFactory.get('Access');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        //check if logged in
        const session = _env.sessionmanager.getSessionOfSocket(_ws);
        if(session === undefined) {
            reject({code: 'client', string: 'currently not logged in'});
        }

        //TODO: check if user is authorized to create access

        let newAccess = new Access(_args);

        _env.debug(METHOD_NAME, `Saving access to database`);

        return db.insertAccess(newAccess).then(() => {
            return newAccess.toJSON(new SimpleResponse({success: true}));

        });
    })
};