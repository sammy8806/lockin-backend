'use strict';

import Promise from 'promise';

const METHOD_NAME = 'AccessService/checkAccess';

module.exports = {
    parameterVariations : [
        {
            key : 'exists',
            lockId : 'exists'
        }
    ],

    setup: (_env) => {
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        // user suchen und zurückgeben
        resolve(() => {
                const key = _args.key;
                const lockId = _args.lockId;

                if (key.data === undefined || key.id === undefined || key.owner_id === undefined) {
                    reject({code: 'client', string: 'invalid arguments'});
                }

                return (
                    key.id === 789453789543789 &&
                    key.owner_id === 123123123 &&
                    lockId === 65456
                );
            },
            (_err) => {
                reject({code: 'server', string: _err});
                console.log(_err);
            }
        );
    })
};