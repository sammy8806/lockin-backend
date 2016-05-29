'use strict';

let _env = null;
let errorList = [];

const table = {
    // Packet Parser
    1001: 'API-Version mismatch',
    1002: 'Missing Parameters',
    1003: 'Methodname invalid',
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
    3007: 'Wrong Password',
    3008: 'Not logged in',
    3009: 'Session already loggedOut',

    // Users
    4001: 'Lifetime is not valid',
    4002: 'No active Session',
    4003: 'E-Mail already exists',
    4004: 'Unknown registration Error',
    4005: 'Access Denied',
    4006: 'User not found',
    4007: 'Wrong password',
    4008: 'internal error',
    4009: 'Please login first',
    4010: 'Wrong search parameters',

    // Admins
    5001: 'Access Denied',
    5002: 'NEIN!',
    5003: 'No active Sessions',

    // Access
    6001: 'Invalid Arguments',
    6002: 'One or more doorlocks not found',
    6003: 'No Access found',
    6004: 'Invalid Key',
    6005: 'Access already exists',

    // Doorlock
    7004: 'Doorlock not found',
    7005: 'Doorlock already exists',

    // Building
    8001: 'Building already exists',
    8002: 'Invalid Arguments',
    8003: 'Building not found'
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
    try {
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
        } else {
            error.comments = [];
        }

        errorList[_id] = error;
    } catch (e) {
        console.error(e);
    }
}

function returnError(_id, _comment) {
    try {
        let err = errorList[_id];

        if (err.comments === undefined) {
            err.comments = [];
        }

        if (_comment !== undefined) {
            err.comments.push(_comment);
        } else if (err.comments.length == 0) {
            err.comments = undefined;
        }

        _env.debug('Errorhandler', `Error ${_id}`, JSON.stringify(_comment));

        return err;
    } catch (e) {
        console.error(e);
    }
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