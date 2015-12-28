//This is a test to show how to use the GCM-Message-object and which properties may be used.
//More information: https://github.com/ToothlessGear/node-gcm.

var GCM = require('./gcm');

var gcm = new GCM();

//Set up API-Key.
var options = {apiKey: 'AIzaSyCTnTdd2RoYKVRG4yDnd1vd_tuznxVH1Pw'};
gcm.setup(options);

//Add the registration tokens of the devices you want to send to.
var regToken = 'clJowgGFg2o:APA91bHoYHPRbcoKXoJPwUIw7pAhVSamlZUJu485aeGbqZAoEan0uMgBeHZOlbjQISBegUXz82Bgi8IDbc-ECrvPJatqa4KngOOIuHBN0UKIkfrX-DHQYf3X2Qgbpf88j92l7UmYRh9G';
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