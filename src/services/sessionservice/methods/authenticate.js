'use strict';

module.exports = {
    call: (_args, _env, _ws, _type) => {
        const SimpleResponse = _env.ObjectFactory.get('SimpleResponse');

        let res = new SimpleResponse({success: false});

        res.success = true;
        console.log("user authenticated");

        return res;
    }
};