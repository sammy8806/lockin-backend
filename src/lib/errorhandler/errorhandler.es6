'use strict';

let _env = null;
let errorList = [];

const table = {
    // Packet Parser
    1001: 'API-Version mismatch',
    1002: 'Missing Parameters',
    1003: 'Methodname invvalid',
    1004: 'Unknown Service',
    1005: 'Unknown Method',
    1006: 'Invalid Parameters',
    1007: 'Invalid JSON',

    // Database
    2001: 'Database not initialised',

    // Sessions
    3001: 'No Session for this Token found',
    3002: 'User not found',
    3003: 'User is corrupt',
    3004: 'Password incorrect',
    3005: 'Already logged in',
    3006: 'Unknown Error',

    // Users
    4001: 'Lifetime is not valid',
    4002: 'No active Session',
    4003: 'E-Mail already exists',
    4004: 'Unknown registration Error',
    4005: 'Access Denied',

    // Admins
    5001: 'Access Denied',
    5002: 'NEIN!',
    5003: 'No active Sessions'
};

function setup(__env) {
    _env = __env;

    for (let errId in table) {
        if (table.hasOwnProperty(errId)) {
            let err = table[errId];
            registerError(errId, err);
        }
    }
}

function registerError(_id, _string, _faulty, _comments) {
    if (errorList[_id] !== undefined) {
        _env.error(`Error ${_id} already defined as "${errorList[_id].string}"!`);
    }

    let error = {
        code: _id,
        string: _string
    };

    if (_faulty !== undefined) {
        error.faulty = _faulty;
    } else {
        error.faulty = '';
    }

    if (_comments !== undefined) {
        if (typeof _comments !== 'object') {
            _comments = [_comments];
        }

        error.comments = _comments;
    }

    errorList[_id] = error;
}

function returnError(_id, _comment) {
    let err = errorList[_id];

    if (_comment !== undefined) {
        err.comments.push(_comment);
    }

    return err;
}

function throwError(_id, _comment) {
    throw returnError(_id, _comment);
}

module.exports = {
    setup,
    registerError,
    returnError,
    throwError
};