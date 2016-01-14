'use strict';

const __METHOD_NAME = 'ChatService/assignRole';

let db;
let Room;
let Session;
let SimpleResponse;

module.exports = {
    setup: (_env) => {
        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Session = _env.ObjectFactory.get('Session');
        Room = _env.ObjectFactory.get('Room');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {
        return db.setUserPermissionsInRoom(_args.group, _args.user, [_args.role])
            .then((_res)=>{
                if(_res.modifiedCount == 1){
                    let response = new SimpleResponse({ success : true});
                    resolve(response);
                }else{ // wenn kein Datensatz modifiziert wurde
                    reject({code: 'server', string: 'user room combination not found'});
                }
            });



    })
};
