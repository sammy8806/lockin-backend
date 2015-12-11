/**
 * Created by hendrik on 11.12.2015.
 */

/**
 * Created by hendrik on 11.12.2015.
 */
'use strict';

let packetParser = require('../../packet_parser.js');
let jsonwspRequest = require('../protocol/jsonwsp_request.js');

let env = {
    ServiceFactory: require('../../../servicefactory/servicefactory.js')
};

env.ServiceFactory.setup(env);

let servicename = "chatservice";
let methodname = "createRoom";
let args = {
    'name' : 'testname'
};
let mirror = 'M1RR0R';

let requestExample = new jsonwspRequest(servicename,methodname,args,mirror);

console.log(packetParser.parsePacket('JSONWSP',JSON.stringify(requestExample),env));