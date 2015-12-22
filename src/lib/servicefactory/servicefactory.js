/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const __MODULE_NAME = 'ServiceFactory';

const fs = require('fs');

let _initialized = false;
let _vars = {};

let _services = {};

const getServiceFile = (_name) => `${getVar('SERVICE_PATH')}/${_name}/service.js`;
const getServiceFunction = (_func) => require(`${getVar('SERVICE_PATH')}/_serviceFunctions.js`)[_func];

_vars.SERVICE_PATH = getServicePath();

module.exports = {
    setup,

    loadFunctions: getServiceFunction('loadFunctions'),
    getFunctions: getServiceFunction('getFunctions'),

    getService,

    SERVICE_PATH : getVar('SERVICE_PATH')
};

function setup(_env) {
    let files = fs.readdirSync(_vars.SERVICE_PATH);

    let _serviceList = [];
    files.forEach((name) => {
        try {
            const path = getServiceFile(name);
            const fsStat = fs.statSync(path);
            if (fsStat.isFile()) {
                _serviceList.push(name);
            }
        } catch (e) {
            console.error(`${e.path} : ${e.code}`);
        }
    });

    _serviceList.forEach((name) => {
        _env.debug(__MODULE_NAME, `Loading Service: ${name}`);
        _services[name] = require(getServiceFile(name));
        _services[name].setup(_env);
        _env.debug(__MODULE_NAME, `Service loaded: ${name}`);
    });

    _initialized = true;
}

function getService(_name) {
    return _services[_name.toLowerCase()];
}

function getVar(_var) {
    return _vars[_var];
}

function getServicePath() {
    return fs.realpathSync(`${__dirname}/../../services`);
}
