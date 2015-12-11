/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

function validateParameter(_args,_argName){

    if (_args.hasOwnProperty(_argName)) {
        if(_args[_argName] != undefined) {
            return true;
        }
    }

    return false;
}

module.exports = {
    validateParameter
} ;