'use strict';

const METHOD_NAME = 'AdminService/getSessionStatus';

module.exports = {
    setup: (_env) => {
    },

    call: (_args, _env, _ws, _type) => {

        return new Promise((go, fail) => {
            setTimeout(() => process.exit(), 1000);
        });
    }
};
