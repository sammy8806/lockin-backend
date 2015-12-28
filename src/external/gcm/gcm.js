'use strict';

let gcm = require('node-gcm');

module.exports = class GCM {
    setup(_options) {
        this.sender = new gcm.Sender(_options.apiKey);
    }

    /**
     * Send the message. Retry a certain number of times, if the message could not be delivered.
     * @param _message the message object
     * @param _regTokens an array of registration tokens of the devices you want to send to
     * @param _tries number of tries
     * @param _callback callback-function to handle failure or success
     */
    send(_message, _regTokens, _tries, _callback) {
        this.sender.send(_message, {registrationTokens: _regTokens}, _tries, _callback);
    }

    static getMessage() {
        return new gcm.Message();
    }
};