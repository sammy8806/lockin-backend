/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let jsonwspParser = require('./jsonwsp/jsonwsp_parser.js');

function parsePacket(_packettype,_packet,_env){
    switch (_packettype){
        case 'JSONWSP':
            let response = jsonwspParser.parse(_packet,_env);
            return JSON.stringify(response);
    }

}

module.exports = {
    parsePacket
};