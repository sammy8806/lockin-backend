'use strict';

const METHOD_NAME = 'AdminService/getSessionStatus';

module.exports = {
    setup: (_env) => {
    },

    call: (_args, _env, _ws, _type) => {

        return new Promise((go, fail) => {

            let session = _env.sessionmanager.getSessionOfSocket(_ws);

            if (session !== undefined) {
                go(session);
            } else {
                fail(_env.ErrorHandler.returnError(5003));
            }

        });
    }
};
