/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const __MODULE_NAME = 'ServiceFactory';

const fs = require('fs');

let _initialized = false;
let _vars = {};

let _services = {};

const getServiceFile = (_name, _fileName) => `${getVar('SERVICE_PATH')}/${_name}/${_fileName}.js`;
const getServiceFunction = (_func) => require(`${getVar('SERVICE_PATH')}/_serviceFunctions.js`)[_func];

_vars.SERVICE_PATH = getServicePath();

module.exports = {
    setup,

    loadFunctions: getServiceFunction('loadFunctions'),
    getFunctions: getServiceFunction('getFunctions'),

    getService,

    SERVICE_PATH: getVar('SERVICE_PATH')
};

function setup(_env, _serviceFileName) {
    let files = fs.readdirSync(_vars.SERVICE_PATH);

    if (_serviceFileName === undefined) {
        _serviceFileName = 'service.js';
    }

    let _serviceList = [];
    files.forEach((name) => {
        try {
            const path = getServiceFile(name, _serviceFileName);
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
        try {
            _services[name] = require(getServiceFile(name, _serviceFileName));
            if (_services[name].deps !== undefined && (typeof _services[name].deps) == 'Array') {
                _services[name].deps.forEach((dep) => {
                    _env.debug(`${__MODULE_NAME}/${name}`, `found dependency: ${dep}`);
                });
            }
            _services[name].setup(_env);
            _env.debug(__MODULE_NAME, `Service loaded: ${name}`);
        } catch (e) {
            _env.error(__MODULE_NAME, `Service could not be loaded: ${name}`);
            console.error(e);
        }
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
