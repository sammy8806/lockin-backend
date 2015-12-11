/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

module.exports = class JsonWspResponse{
    constructor(_servicename, _methodname, _result, _reflection){
        this.type = 'jsonwsp/response';
        this.version = '1.0';
        this.methodname = `${_servicename}/${_methodname}`;
        this.result = _result;
        this.reflection = _reflection;
    }

    toJson(){
        return JSON.stringify(this);
    }
};