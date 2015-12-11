/**
 * Created by hendrik on 11.12.2015.
 */
'use strict';

let jsonwspValidator = require('../jsonwsp_parser.js');
let jsonwspRequest = require('../protocol/jsonwsp_request.js');

let env = {
    ServiceFactory: require('../../../servicefactory/servicefactory.js')
};

env.ServiceFactory.setup(env);

let servicename = "userservice";
let methodname = "register";
let args = {
    'mail' : 'testmail',
    'password' : 'testpw'
};
let mirror = 'M1RR0R';

let requestExample = new jsonwspRequest(servicename,methodname,args,mirror);

try{
    console.log(jsonwspValidator.parse(requestExample.toJson(),{}));
}catch(err){
    console.log(err);
}