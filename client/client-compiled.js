'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wsUri = 'ws://localhost:8080/';
var output = undefined;
var last = 0;
var requests = new Map();
var requestCallbacks = new Map();

var websocketOpen = false;

function debug() {
    var _console;

    (_console = console).log.apply(_console, arguments);
}

var JsonWspRequest = function () {
    // aka jsonwsp/request

    function JsonWspRequest(method, args) {
        var mirror = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        _classCallCheck(this, JsonWspRequest);

        this.type = 'jsonwsp/request';
        this.version = '1.0';

        this.methodname = method;
        this.args = args;
        this.mirror = mirror;
    }

    _createClass(JsonWspRequest, [{
        key: 'setMirror',
        value: function setMirror(mirror) {
            this.mirror = mirror;
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }, {
        key: 'sendJson',
        value: function sendJson() {
            this.sent = Date.now();
            return this.toJson();
        }
    }, {
        key: 'setCallback',
        value: function setCallback(_cb) {
            requestCallbacks.set(this, _cb);
        }
    }, {
        key: 'getCallback',
        value: function getCallback() {
            return requestCallbacks.get(this);
        }
    }]);

    return JsonWspRequest;
}();

var JsonWspResponse = function () {
    // aka jsonwsp/response

    function JsonWspResponse(data) {
        _classCallCheck(this, JsonWspResponse);

        if (typeof data === 'string') data = JSON.parse(data);

        var keys = Object.keys(data);
        for (var it = 0; it < keys.length; it++) {
            this[keys[it]] = data[keys[it]];
            // debug(`${this[keys[it]]} = ${data[keys[it]]}`);
        }
    }

    _createClass(JsonWspResponse, [{
        key: 'setResult',
        value: function setResult(_result) {
            this.result = _result;
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }]);

    return JsonWspResponse;
}();

var JsonWspFault = function () {
    // aka jsonwsp/fault

    function JsonWspFault(data) {
        _classCallCheck(this, JsonWspFault);

        if (typeof data == 'string') data = JSON.parse(data);

        var keys = Object.keys(data);
        for (var it = 0; it < keys.length; it++) {
            this[keys[it]] = data[keys[it]];
            // debug(`${this[keys[it]]} = ${data[keys[it]]}`);
        }
    }

    _createClass(JsonWspFault, [{
        key: 'toJson',
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }]);

    return JsonWspFault;
}();

function init() {
    output = document.getElementById('output');

    document.querySelector('#send').onclick = function () {
        var service = document.querySelector('#service').value;
        var method = document.querySelector('#method').value;
        var args = JSON.parse(document.querySelector('#args').value);

        var callback = function callback(_data, _res) {
            console.log(_data);
            writeToScreen('\n        <div class="bg-success">\n            <span class="small">(' + _res.methodname + ')</span>\n            ' + JSON.stringify(_data) + '\n        </div>');
        };

        doSocketStuff(function () {
            return sendRequest(service, method, args, callback);
        });
    };

    document.querySelector('#startConnectionBtn').onclick = function () {
        document.querySelector('#startConnectionBtn').setAttribute('disabled', 'true');
        document.querySelector('#killConnectionBtn').removeAttribute('disabled');

        startConnection();
    };

    document.querySelector('#killConnectionBtn').onclick = function () {
        document.querySelector('#killConnectionBtn').setAttribute('disabled', 'true');
        document.querySelector('#startConnectionBtn').removeAttribute('disabled');

        killConnection();
    };

    document.querySelector('#register').onclick = function () {
        var user = document.querySelector('#register-mail').value;
        var pass = document.querySelector('#register-pass').value;
        var args = { email: user, password: pass };

        var callback = function callback(_data, _res) {
            console.log(_data);
            writeToScreen('<div class="bg-success"><span class="small">Register success</span></div>');
        };

        doSocketStuff(function () {
            return sendRequest('userservice', 'register', args, callback);
        });
    };

    document.querySelector('#login').onclick = function () {
        var user = document.querySelector('#login-mail').value;
        var pass = document.querySelector('#login-pass').value;
        var args = { email: user, password: pass };

        var callback = function callback(_data, _res) {
            writeToScreen('<div class="bg-success"><span class="small">Login success</span></div>');
        };

        doSocketStuff(function () {
            return sendRequest('sessionservice', 'login', args, callback);
        });
    };

    document.querySelector('#auth').onclick = function () {
        var key = document.querySelector('#login-key').value;
        var args = { sessionToken: key };

        var callback = function callback(_data, _res) {
            writeToScreen('<div class="bg-success"><span class="small">Login success</span></div>');
        };

        doSocketStuff(function () {
            return sendRequest('sessionservice', 'authenticate', args, callback);
        });
    };

    document.querySelector('#logout').onclick = function () {
        var callback = function callback(_data, _res) {
            writeToScreen('<div class="bg-success"><span class="small">Logout success</span></div>');
        };

        doSocketStuff(function () {
            return sendRequest('sessionservice', 'logout', {}, callback);
        });
    };

    setInterval(function () {
        if (websocketOpen) {
            sendRequest('adminservice', 'getSessionStatus', {}, function (_data, _res) {
                displaySessionData(_data.sessionId, _data.userId);
                document.querySelector('#login-key').value = _data.sessionId;
            });

            sendRequest('chatservice', 'getRooms', {}, function (_data, _res) {
                var tmp = document.createElement('ul');
                _data.forEach(function (_room) {
                    var li = document.createElement('li');
                    li.style.wordWrap = 'break-word';
                    li.innerHTML = _room;

                    tmp.appendChild(li);
                });

                var list = document.querySelector('#room-list');
                for (var n = 0; list.childNodes.length; n++) {
                    var el = list.firstChild;
                    list.removeChild(el);
                }
                list.appendChild(tmp);
            });
        }
    }, 1000);
}

function displaySessionData(_sessionId, _userId) {
    document.querySelector('#session-id').innerHTML = _sessionId;
    document.querySelector('#user-id').innerHTML = _userId;
}

var websocket = null;
function testWebSocket() {
    websocket = new WebSocket(wsUri);

    websocket.onopen = function (evt) {
        writeToScreen('CONNECTED');
        websocketOpen = true;

        document.querySelector('#startConnectionBtn').setAttribute('disabled', 'true');
        document.querySelector('#killConnectionBtn').removeAttribute('disabled');
    };
    websocket.onclose = function (evt) {
        writeToScreen('DISCONNECTED');
        websocketOpen = false;

        displaySessionData('', '');

        document.querySelector('#killConnectionBtn').setAttribute('disabled', 'true');
        document.querySelector('#startConnectionBtn').removeAttribute('disabled');
    };
    websocket.onmessage = function (evt) {
        var type = JSON.parse(evt.data).type;

        if (type === 'jsonwsp/response') {
            var res = new JsonWspResponse(evt.data);
            var _ref = res.reflection;
            var _req = requests.get(_ref);
            var _cb = _req.getCallback();
            _cb(res.result, res);
        } else if (type === 'jsonwsp/fault') {
            var res = new JsonWspFault(evt.data);
            var _ref = res.reflection;
            var _req = requests.get(_ref);

            if (_req.methodname === 'adminservice/getSessionStatus') {
                console.log('Request session status');
                return;
            }

            writeToScreen('\n            <div class="bg-danger">\n                ' + _req.methodname + ':\n                ' + res.fault.code + ' - ' + res.fault.string + '\n            </div>\n            ');
        } else if (type === 'jsonwsp/request') {
            var res = new JsonWspRequest(evt.data);
            //const _ref = res.reflection;
            //const _req = requests.get(_ref);

            writeToScreen('\n            <div class="bg-info">\n                ' + res.methodname + ': ' + JSON.stringify(res.args) + '\n            </div>\n            ');
        } else {
            console.log(evt.data);
        }
    };
    websocket.onerror = function (evt) {
        console.error(evt);
        writeToScreen('<div class="bg-danger">ERROR: ' + evt.data + ' </div>');
    };
}

function doSend(message) {
    // writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message) {
    var pre = document.createElement('p');
    pre.style.wordWrap = 'break-word';
    pre.innerHTML = message;

    output.insertBefore(pre, output.firstChild);
}

function sendRequest(service, method, args, callback) {
    var req = request(service + '/' + method, args);
    req.setCallback(callback);
    doSend(req.toJson());
}

function request() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var req = new (Function.prototype.bind.apply(JsonWspRequest, [null].concat(args)))();
    req.setMirror(last);
    requests.set(last, req);
    //debug(`[DEBUG] Inserted ${last} in map`);

    last++;
    return req;
}

function startConnection() {
    output.innerHTML = '';
    wsUri = document.querySelector('#connection_addr').value;

    if (!websocketOpen) {
        testWebSocket();
    } else {
        writeToScreen('<small><div class="bg-danger">Please <b>close</b> the Connection first!</div></small>');
    }
}

function doSocketStuff(_cb) {
    if (websocketOpen) {
        _cb();
    } else {
        writeToScreen('<small><div class="bg-danger">Please <b>open</b> the Connection first!</div></small>');
    }
}

function killConnection() {
    websocket.close();
}

window.addEventListener('load', init, false);