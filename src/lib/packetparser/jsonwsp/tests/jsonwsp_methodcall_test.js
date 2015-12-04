/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let methodvalidator = require('../method_validator.js');


let servicename = 'userservice';
let methodname = 'register';
let args = {
    'mail' : 'testmail',
    'password' : 'testpw'
};

try{
    console.log(methodvalidator.validateMethodCall(servicename,methodname,args));
}catch (err){
    console.log(err);
}