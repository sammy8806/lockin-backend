/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

module.exports = class JsonWspFault{
    constructor(_errData, _reflection){
        this.type = 'jsonwsp/fault';
        this.version = '1.0';
        this.fault = _errData;
        this.reflection = _reflection;
    }

    toJson(){
        return JSON.stringify(this);
    }
};