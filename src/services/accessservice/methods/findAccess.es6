'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/findAccess';

let db;
let User;
let Access;
let Building;

//The function to create a hashmap to do the mapping
function createHashOfResults(results) {
    let hash = {};

    for (let i = 0; i < results.length; i++) {
        let item = results[i];
        let id = item._id;
        hash[id] = item;
    }
    return hash;
}


module.exports = {
    parameterVariations: [
        {accessId: 'exists'},
        {requestorId: 'exists'},
        {doorLockIds: 'exists'},
        {keyId: 'exists'}
    ],

    setup: (_env) => {
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
        User = _env.ObjectFactory.get('User');
        Access = _env.ObjectFactory.get('Access');
        Building = _env.ObjectFactory.get('Building');
    },
    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {


        resolve(User.getLoggedIn(_ws, db)
            .then((_user) => {
                let args = Object.keys(_args);
                _env.debug(METHOD_NAME, 'Got: ' + JSON.stringify(args));
                let intersect = _env.arrayIntersect(args, ['accessId', 'requestorId', 'doorLockIds']);
                _env.debug(METHOD_NAME, 'Find: ' + JSON.stringify(intersect));

                if (intersect.length !== 1) {
                    _env.ErrorHandler.throwError(1006);
                }

                let search = {};
                search[intersect[0]] = _args[intersect[0]];

                _env.debug(METHOD_NAME, 'Search: ' + JSON.stringify(search));

                return db.findAccess(search).toArray().then((_accesses) => {
                    let buildingIds = [];

                    //get building ids
                    for (let i = 0; i < _accesses.length; i++) {
                        buildingIds.push(_accesses[i].buildingId);
                    }
                    
                    return db.findBuildingsByIds(buildingIds).toArray().then((_buildings) => {
                        let accesses = [];

                        //necessary to make sure the order of building-objects matches the order of buildingIds
                        let hash = createHashOfResults(_buildings);

                        //add building objects to access objects
                        for (let i = 0; i < buildingIds.length; i++) {
                            let buildingId = buildingIds[i];
                            let building = hash[buildingId];
                            _accesses[i].building = new Building(building).toJSON();
                            delete building.keyId;
                            delete _accesses[i].buildingId;
                            accesses.push(new Access(_accesses[i]).toJSON());
                        }
                        return accesses;
                    });
                })
            }));
    })
};