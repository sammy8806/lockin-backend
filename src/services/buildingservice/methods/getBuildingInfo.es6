'use strict';

import Promise from 'promise';

const METHOD_NAME = 'BuildingService/getBuildingInfo';

let db;
let Building;

module.exports = {
    parameterVariations: [
        {
            id: 'exists'
        }
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        Building = _env.ObjectFactory.get('Building');
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        resolve(db.findBuilding({id: _args.id})
            .then((_buildings) => {
                    if (_buildings.length === 0) {
                        _env.ErrorHandler.throwError(8003);
                    }

                    _env.debug(METHOD_NAME, 'Found ' + _buildings.length + ' Buildings');
                    let building = new Building(_buildings[0]);

                    return building.toJSON();
                }
            )
        );
    })
};
