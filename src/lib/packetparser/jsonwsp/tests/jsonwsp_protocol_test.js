/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

//-----------------------------------------------------------------------
let JsonWspFault = require('../protocol/jsonwsp_fault.js');

let mirrorData = 'AMJKIOJ)MK';
let errData = {
    'code' : 'Client',
    'string' : 'client did stuff wrong'
};
let fault1 = new JsonWspFault(errData,mirrorData);
console.log(fault1.toJson());

//-----------------------------------------------------------------------
let JsonWspResponse = require('../protocol/jsonwsp_response.js');

let servicename = 'userservice';
let methodname = 'register';
let result = {
    'success' : true
};
mirrorData = 'c00lM1Rr0rData';
let response1 = new JsonWspResponse(servicename,methodname,result,mirrorData);
console.log(response1.toJson());

//-----------------------------------------------------------------------
let JsonWspRequest = require('../protocol/jsonwsp_request.js');

servicename = 'userservice';
methodname = 'register';
let args = {
    'email' : 'testmail',
    'password' : 'testpw'
};
mirrorData = 'superC00lM1rr0rData';
let request1 = new JsonWspRequest(servicename,methodname,args,mirrorData);
console.log(request1.toJson());