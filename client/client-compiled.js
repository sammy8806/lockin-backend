'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wsUri = "ws://localhost:8080/";
var output = undefined;
var last = 0;
var requests = new Map();
var requestCallbacks = new Map();

function debug() {
    var _console;

    (_console = console).log.apply(_console, arguments);
}

var JsonWspRequest = (function () {
    // aka jsonwsp/request

    function JsonWspRequest(method, args) {
        var mirror = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        _classCallCheck(this, JsonWspRequest);

        this.type = "jsonwsp/request";
        this.version = "1.0";

        this.methodname = method;
        this.args = args;
        this.mirror = mirror;
    }

    _createClass(JsonWspRequest, [{
        key: "setMirror",
        value: function setMirror(mirror) {
            this.mirror = mirror;
        }
    }, {
        key: "toJson",
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }, {
        key: "sendJson",
        value: function sendJson() {
            this.sent = Date.now();
            return this.toJson();
        }
    }, {
        key: "setCallback",
        value: function setCallback(_cb) {
            requestCallbacks.set(this, _cb);
        }
    }, {
        key: "getCallback",
        value: function getCallback() {
            return requestCallbacks.get(this);
        }
    }]);

    return JsonWspRequest;
})();

var JsonWspResponse = (function () {
    // aka jsonwsp/response

    function JsonWspResponse(data) {
        _classCallCheck(this, JsonWspResponse);

        if (typeof data == 'string') data = JSON.parse(data);

        var keys = Object.keys(data);
        for (var it = 0; it < keys.length; it++) {
            this[keys[it]] = data[keys[it]];
            // debug(`${this[keys[it]]} = ${data[keys[it]]}`);
        }
    }

    _createClass(JsonWspResponse, [{
        key: "setResult",
        value: function setResult(_result) {
            this.result = _result;
        }
    }, {
        key: "toJson",
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }]);

    return JsonWspResponse;
})();

var JsonWspFault = (function () {
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
        key: "toJson",
        value: function toJson() {
            var json = JSON.stringify(this);
            return json;
        }
    }]);

    return JsonWspFault;
})();

function init() {
    output = document.getElementById("output");
    testWebSocket();

    document.querySelector('#send').onclick = function () {
        sendRequest();
    };
    document.querySelector('#startConnectionBtn').onclick = function () {
        startConnection();
    };
}

var websocket = null;
function testWebSocket() {
    websocket = new WebSocket(wsUri);

    websocket.onopen = function (evt) {
        writeToScreen("CONNECTED");
    };
    websocket.onclose = function (evt) {
        writeToScreen("DISCONNECTED");
    };
    websocket.onmessage = function (evt) {
        var type = JSON.parse(evt.data).type;

        if (type != "jsonwsp/fault") {
            var res = new JsonWspResponse(evt.data);
            var _ref = res.reflection;
            var _req = requests.get(_ref);
            var _cb = _req.getCallback();
            _cb(res.result, res);
        } else {
            console.log(evt);

            var res = new JsonWspFault(evt.data);
            var _ref = res.reflection;
            var _req = requests.get(_ref);

            writeToScreen("\n            <div class=\"bg-danger\">\n                " + _req.methodname + ":\n                " + res.fault.code + " - " + res.fault.string + "\n            </div>\n            ");
        }
    };
    websocket.onerror = function (evt) {
        console.error(evt);
        writeToScreen("<div class=\"bg-danger\">ERROR: " + evt.data + " </div>");
    };
}

function doSend(message) {
    // writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

function sendRequest() {
    var service = document.querySelector('#service').value;
    var method = document.querySelector('#method').value;
    var args = JSON.parse(document.querySelector('#args').value);

    var req = request(service + "/" + method, args);
    req.setCallback(function (_data, _res) {
        console.log(_data);
        writeToScreen("\n        <div class=\"bg-success\">\n            <span class=\"small\">(" + _res.methodname + ")</span>\n            " + JSON.stringify(_data) + "\n        </div>");
    });
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

    testWebSocket();
}

function killConnection() {
    websocket.close();
}

window.addEventListener("load", init, false);