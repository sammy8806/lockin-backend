'use strict';

import Promise from 'promise';

const METHOD_NAME = 'UserService/addBuilding';

let db;
let User;
let Building;

module.exports = {
    parameterVariations: [
        {
            street: 'exists',
            houseNumber: 'exists',
            zipCode: 'exists',
            town: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        Building = _env.ObjectFactory.get('Building');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        if (!User.isLoggedIn(_ws)) {
            reject(_env.ErrorHandler.returnError(4005));
        }

        let building = new Building(_args);

        let ret = db.findBuilding(building).then((_oldBuilding) => {
            if (_oldBuilding.length !== 0) {
                _env.debug(METHOD_NAME, `Found ${_oldBuilding.length} old Buildings`);
                _env.ErrorHandler.throwError(8001);
            }

            _env.debug(METHOD_NAME, 'Found no old Buildings');

            return db.addBuilding(building)
                .then((_newBuilding) => {
                    _env.debug(METHOD_NAME, 'NewBuilding: ' + JSON.stringify(_newBuilding));
                    // _env.debug(METHOD_NAME, require('util').inspect(_newBuilding));
                    building.id = _newBuilding.insertedId;
                    return building.toJSON();
                });
        });

        resolve(ret);
    })
};