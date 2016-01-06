/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const Promise = require('promise');
let jsonwspParser = require('./jsonwsp/jsonwsp_parser.js');

function parsePacket(_packettype, _packet, _env, _ws) {
    return new Promise((resolve, reject) => {
        switch (_packettype) {
            case 'JSONWSP':
                const returnAction = JSON.stringify;
                return resolve(jsonwspParser.parse(_packet, _env, _ws).then(returnAction, returnAction));
        }
    });
}

function buildRequest(_packettype, _servicename, _methodname, _args, _mirror) {
    return new Promise((resolve, reject) => {
        switch (_packettype) {
            case 'JSONWSP':
                return resolve(jsonwspParser.buildRequest(_servicename, _methodname, _args, _mirror))
                    .then(JSON.stringify);
        }
    });
}

module.exports = {
    parsePacket,
    buildRequest
};
