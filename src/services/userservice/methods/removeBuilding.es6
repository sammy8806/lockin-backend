'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/removeBuilding';

let db;
let SimpleResponse;
let User;
let Building;

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
        Building = _env.ObjectFactory.get('Building');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(3008));
        }

        if (_args.id === undefined) {
            _env.debug(METHOD_NAME, 'ID for delete was not provided');
            reject(_env.ErrorHandler.returnError(3008));
        }

        let res = new SimpleResponse({success: false});
        let building = new Building(_args);

        resolve(db.removeBuilding(building).then(
            (result) => {
                if(result.deletedCount === 0) {
                    _env.ErrorHandler.throwError(8003);
                }

                res.success = true;
                return res;
            }, (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            })
        );
    })
};