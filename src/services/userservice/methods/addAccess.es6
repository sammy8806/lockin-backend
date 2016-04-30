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

        let id = _args.id;
        let key = _args.key;
        let requestor_id = _args.requestor_id;
        let time_start = _args.time_start;
        let time_end = _args.time_end;
        let state = _args.state;
        let newAccess = new Access({
            id: id,
            key: key,
            requestor_id: requestor_id,
            time_start: time_start,
            time_end: time_end,
            state: state
        });

        _env.debug(METHOD_NAME, `Saving access to database`);

        return db.insertAccess(newAccess).then(() => {
            return newAccess.toJSON(new SimpleResponse({success: true}));

        });
    })
};