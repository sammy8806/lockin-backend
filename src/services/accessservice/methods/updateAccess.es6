'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/updateAccess';

let db;
let SimpleResponse;
let User;
let Access;

module.exports = {
    parameterVariations: [
        {
            'id': 'exists'
        }
    ],
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        Access = _env.ObjectFactory.get('Access');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(3008));
        }

        if(_args.id === undefined) {
            _env.debug(METHOD_NAME, 'ID for Update was not provided');
            reject(_env.ErrorHandler.returnError(3008));
        }

        let res = new SimpleResponse({success: false});
        let access = new Access(_args);
        let accessId = access.id;
        delete access.id;

        if(access.length === 0) {
            _env.debug(METHOD_NAME, 'Not enough Parameters to Update');
            reject(_env.ErrorHandler.returnError(3008));
        }

        resolve(db.updateAccess({id: accessId}, access.toJSON()).then(
            () => {
                res.success = true;
                return res;
            }, (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            })
        );
    })
};