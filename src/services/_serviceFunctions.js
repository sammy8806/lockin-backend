'use strict';

const fs = require('fs');

function log(_type, _tag, _string) {
    console.log('[%s] [%s] %s', _type, _tag, _string);
}

function debug(_tag, _string) {
    log('DEBUG', _tag, _string);
}

module.exports = {
    loadFunctions,
    getFunctions,
    debug,
    log
};

const getMethodPath = (_name) => fs.realpathSync(__dirname + '/' + _name.toLowerCase()) + '/methods';
const getMethodFile = (_serviceName, _name) => `${getMethodPath(_serviceName)}/${_name}.js`;

const removeFileExtension = (_file) => {
    let _tmp = _file.split('.');
    _tmp.pop();
    return _tmp.join('.');
};

function getFunctions(_serviceName) {
    const METHOD_PATH = getMethodPath(_serviceName);
    let files = fs.readdirSync(METHOD_PATH);

    let _functionList = [];
    files.forEach((name) => {
        name = removeFileExtension(name);
        if (name.substr(0, 1) !== '.') {
            try {
                const path = getMethodFile(_serviceName, name);
                const fsStat = fs.statSync(path);
                if (fsStat.isFile()) {
                    _functionList.push(name);
                }
            } catch (e) {
                console.error(`${e.path} : ${e.code}`);
            }
        }
    });

    return _functionList;
}

function loadFunctions(_serviceName) {
    const _serviceList = getFunctions(_serviceName);

    let _functions = {};
    _serviceList.forEach((name) => {
        debug(_serviceName, `Loading Method: ${name}`);
        _functions[name] = require(getMethodFile(_serviceName, name));
        debug(_serviceName, `Method loaded: ${name}`);
    });

    return _functions;
}
