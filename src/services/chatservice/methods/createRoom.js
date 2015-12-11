/**
 * Created by steve on 11.12.2015.
 */
'use strict';

module.exports = {
    call : (_args, _env) => {
        console.log(_args.name);

        return {greeting: _args.name};
    }
};
