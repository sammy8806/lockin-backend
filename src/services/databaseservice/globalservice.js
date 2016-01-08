'use strict';

const SERVICE_NAME = 'DatabaseService';

const defaultDriver = 'MONGO';

let __driver;
let __driverInstances = [];

function setup(_env, _driver) {

    // Default probably via config?
    __driver = _driver === undefined ? defaultDriver : _driver;
    _env.debug(SERVICE_NAME, `Using backend: ${__driver}`);

    switch (__driver) {
        case 'RAM' :
            __driverInstances[__driver] = require(
                __dirname + '/drivers/' + __driver.toLowerCase()
            );
            break;

        case 'MONGO':
            let drv = require(
                __dirname + '/drivers/' + __driver.toLowerCase()
            );

            drv.setup(_env, true);

            __driverInstances[__driver] = drv;
            break;

        default:
            throw {code: 'internal', text: 'Please set database-driver before use.'};
    }
}

function getDriver(_driver) {
    _driver = _driver === undefined ? defaultDriver : _driver;
    return __driverInstances[_driver];
}

module.exports = {
    setup,
    getDriver
};
