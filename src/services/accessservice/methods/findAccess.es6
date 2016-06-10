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

                if (_user === undefined) {
                    _env.ErrorHandler.throwError(3002);
                }

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
                    if (_accesses === undefined || _accesses.length === 0) {
                        _env.debug(METHOD_NAME, 'No Accesses found');
                        return [];
                    }

                    _env.debug(METHOD_NAME, 'Found ' + _accesses.length + ' accesses');

                    let buildingIds = [];
                    let accesses = [];

                    //get building ids
                    for (let i = 0; i < _accesses.length; i++) {
                        accesses.push(new Access(_accesses[i]).toJSON());
                        buildingIds.push(_accesses[i].buildingId);
                    }

                    _env.debug(METHOD_NAME, `Raw Accesses Found: ${JSON.stringify(_accesses)}`);
                    _env.debug(METHOD_NAME, `Accesses Found: ${JSON.stringify(accesses)}`);
                    _env.debug(METHOD_NAME, `Buildings Found: ${JSON.stringify(buildingIds)}`);

                    // TODO: in map speichern (dann nur einmalig)

                    return db.findBuildingsByIds(buildingIds).toArray()
                        .then((_buildings) => {
                            if (_buildings.length < 1) {
                                _env.debug(METHOD_NAME, 'One or more buildings not found');
                                _env.ErrorHandler.throwError(8003);
                            }

                            //necessary to make sure the order of building-objects matches the order of buildingIds
                            let hash = createHashOfResults(_buildings);
                            _env.debug(METHOD_NAME, `Found Buildings: ${_env.inspect(_buildings)}`);
                            _env.debug(METHOD_NAME, `HashMap: ${_env.inspect(hash)}`);

                            _env.debug(METHOD_NAME, 'Adding building to access object');

                            //add building objects to access objects
                            accesses.forEach((_access) => {
                                let building = hash[_access.buildingId];

                                if(building === undefined) {
                                    _access.deleteMe = true;
                                    return;
                                }

                                _env.debug(METHOD_NAME, `Access: ${_access.id} # Building: ${JSON.stringify(building)}`);
                                delete _access.building.buildingId;

                                _access.building = new Building(building).toJSON();
                                delete _access.building.keyId;
                            });

                            accesses.filter((_access) => { return _access.deleteMe === undefined; });

                            return accesses;
                        });
                })
            }));
    })
};