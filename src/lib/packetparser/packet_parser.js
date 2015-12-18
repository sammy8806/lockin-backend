/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let jsonwspParser = require('./jsonwsp/jsonwsp_parser.js');

function parsePacket(_packettype,_packet,_env,_ws){
    switch (_packettype){
        case 'JSONWSP':
            let response = jsonwspParser.parse(_packet,_env,_ws);
            return JSON.stringify(response);
    }

}

function buildRequest(_packettype,_servicename,_methodname,_args,_mirror){
    switch (_packettype){
        case 'JSONWSP':
            let response = jsonwspParser.buildRequest(_servicename,_methodname,_args,_mirror);
            return JSON.stringify(response);
    }
}


module.exports = {
    parsePacket,
    buildRequest
};