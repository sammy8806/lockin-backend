/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

module.exports = class JsonWspRequest{
    constructor(_servicename,_methodname,_args,_mirror){
        this.type = 'jsonwsp/response';
        this.version = '1.0';
        this.methodname = `${_servicename}/${_methodname}`;
        this.args = _args;
        this.mirror = _mirror;
    }

    toJson(){
        return JSON.stringify(this);
    }
};