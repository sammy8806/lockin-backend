/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let JsonWspFault = require('../protocol/jsonwsp_fault.js');

let mirrorData = 'AMJKIOJ)MK';
let errData = {
    'code' : 'Client',
    'string' : 'client did stuff wrong'
};
let fault1 = new JsonWspFault(errData,mirrorData);
console.log(fault1.toJson());