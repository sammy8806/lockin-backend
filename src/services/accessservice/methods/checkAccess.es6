'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/checkAccess';

module.exports = {
    parameterVariations: [
        {
            key: 'exists',
            lockId: 'exists'
        }
    ],

    setup: (_env) => {
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        const key = _args.key;
        const lockId = _args.lockId;

        if (key.data === undefined || key.id === undefined || key.owner_id === undefined) {
            reject({code: 'client', string: 'invalid arguments'});
        }

        let res;
        if (
            key.id === '789453789543789' &&
            key.owner_id === '123123123' &&
            lockId === '65456'
        ) {
            res = true;
            _env.debug(METHOD_NAME, lockId, 'Access Granted!', JSON.stringify(key));
        } else {
            res = false;
            _env.debug(METHOD_NAME, lockId, 'Access Denied!', JSON.stringify(key));
        }

        resolve(res);
    })
};