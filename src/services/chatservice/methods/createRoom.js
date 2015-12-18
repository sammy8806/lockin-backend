/**
 * Created by steve on 11.12.2015.
 */
'use strict';

module.exports = {
    call : (_args, _env, _ws, _type) => {
        console.log(_type);

        return {greeting: _args.name};
    }
};
