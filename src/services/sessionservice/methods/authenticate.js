"use strict"

module.exports = {
    call : authenticate
};

function authenticate(_args, _env) {
    let res = { success: false }; // simpleresponse

    res.success = true;
    console.log("user authenticated");

    return res;
}