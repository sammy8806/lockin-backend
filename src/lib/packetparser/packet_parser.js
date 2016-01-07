/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let jsonwspParser = require('./jsonwsp/jsonwsp_parser.js');

function parsePacket(_packettype, _packet, _env, _ws) {
    return new Promise((resolve, reject) => {
        switch (_packettype) {
            case 'JSONWSP':
                const returnAction = JSON.stringify;
                resolve(jsonwspParser.parse(_packet, _env, _ws).then(returnAction, returnAction));
        }
    }).catch((_err) => {
        _env.error('PacketParser', _err);
    });
}

function buildRequest(_packettype, _servicename, _methodname, _args, _mirror) {
    return new Promise((resolve, reject) => {
        switch (_packettype) {
            case 'JSONWSP':
                resolve(jsonwspParser.buildRequest(_servicename, _methodname, _args, _mirror))
                    .then(JSON.stringify);
        }
    }).catch((_err) => {
        console.error('PacketParser', _err);
    });
}

module.exports = {
    parsePacket,
    buildRequest
};
