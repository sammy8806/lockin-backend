/**
 * Created by steve on 11.12.2015.
 */
'use strict';

module.exports = {
    call : (_args, _env, _ws, _type) => {
        try{
            _env.websockethandler.sendMessage(_ws, _env.packetParser.buildRequest('JSONWSP','servicenamehere','methodnamehere',{},'mirrorhere'));
        }
        catch(err){
            console.log(err);
        }
        return {greeting: _args.name};
    }
};
