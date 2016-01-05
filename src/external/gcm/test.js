//This is a test to show how to use the GCM-Message-object and which properties may be used.
//More information: https://github.com/ToothlessGear/node-gcm.

var GCM = require('./gcm');

var gcm = new GCM();

//Set up API-Key.
var options = {apiKey: 'AIzaSyDIbh0BkcxhoUgHudn-fOw7itCnPnxwuQ8'};
gcm.setup(options);

//Add the registration tokens of the devices you want to send to.
var regToken = 'APA91bHaitmlvlrWz9u1i5V4jV7e7igcZYQMMGqkkRKSlyZwWgUkOX7urfv7MyutJo5dSh_J6xdzvKtfqbhZCa9OgjySpDeBEze4NVeIhdszrw7KZ2wWpHnC2BcpLuGfs_me4eGC8hVV';
var receivers = [regToken];

//Create a message.
var message = GCM.getMessage();
message.collapseKey = 'demo';
message.priority = 'high';
message.contentAvailable = true;
message.delayWhileIdle = true;
message.timeToLive = 3;
message.restrictedPackageName = 'somePackageName';
message.dryRun = true;
message.data = {
    key1: 'message1',
    key2: 'message2'
};
message.notification = {
    title: "Hello, World",
    icon: "ic_launcher",
    body: "This is a notification that will be displayed ASAP."
};

var callback = function (err, response) {
    if (err) console.error(err);
    else console.log(response);
};

gcm.send(message, receivers, callback);