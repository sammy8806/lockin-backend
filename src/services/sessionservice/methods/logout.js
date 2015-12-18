"use strict"

module.exports = {
    call : logout
};

function logout(_args, _env) {
    let res = { success: false }; // simpleresponse

    res.success = true;
    console.log("user logged out");

    return res;
}