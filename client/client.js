'use strict';

let wsUri = "ws://localhost:8080/";
let output;
let last = 0;
let requests = new Map();
let requestCallbacks = new Map();

function debug(...args) {
    console.log(...args);
}

class JsonWspRequest { // aka jsonwsp/request
    constructor(method, args, mirror = null) {
        this.type = "jsonwsp/request";
        this.version = "1.0";

        this.methodname = method;
        this.args = args;
        this.mirror = mirror;
    }

    setMirror(mirror) {
        this.mirror = mirror;
    }

    toJson() {
        const json = JSON.stringify(this);
        return json;
    }

    sendJson() {
        this.sent = Date.now();
        return this.toJson();
    }

    setCallback(_cb) {
        requestCallbacks.set(this, _cb);
    }

    getCallback() {
        return requestCallbacks.get(this);
    }
}

class JsonWspResponse { // aka jsonwsp/response
    constructor(data) {
        if (typeof data == 'string')
            data = JSON.parse(data);

        const keys = Object.keys(data);
        for (let it = 0; it < keys.length; it++) {
            this[keys[it]] = data[keys[it]];
            // debug(`${this[keys[it]]} = ${data[keys[it]]}`);
        }
    }

    setResult(_result) {
        this.result = _result;
    }

    toJson() {
        const json = JSON.stringify(this);
        return json;
    }
}

class JsonWspFault { // aka jsonwsp/fault
    constructor(data) {
        if (typeof data == 'string')
            data = JSON.parse(data);

        const keys = Object.keys(data);
        for (let it = 0; it < keys.length; it++) {
            this[keys[it]] = data[keys[it]];
            // debug(`${this[keys[it]]} = ${data[keys[it]]}`);
        }
    }

    toJson() {
        const json = JSON.stringify(this);
        return json;
    }
}

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

let websocket = null;
function testWebSocket() {
    websocket = new WebSocket(wsUri);

    websocket.onopen = function (evt) {
        writeToScreen("CONNECTED");
    };
    websocket.onclose = function (evt) {
        writeToScreen("DISCONNECTED");
    };
    websocket.onmessage = function (evt) {
        const type = JSON.parse(evt.data).type;

        if (type == "jsonwsp/response") {
            const res = new JsonWspResponse(evt.data);
            const _ref = res.reflection;
            const _req = requests.get(_ref);
            const _cb = _req.getCallback();
            _cb(res.result, res);
        } else if (type == "jsonwsp/fault") {
            console.log(evt);

            const res = new JsonWspFault(evt.data);
            const _ref = res.reflection;
            const _req = requests.get(_ref);

            writeToScreen(`
            <div class="bg-danger">
                ${_req.methodname}:
                ${res.fault.code} - ${res.fault.string}
            </div>
            `);
        } else {
            console.log(evt);

            writeToScreen(`
            <div class="bg-danger">
                ${JSON.stringify(evt)}
            </div>
            `);
        }
    };
    websocket.onerror = function (evt) {
        console.error(evt);
        writeToScreen(`<div class="bg-danger">ERROR: ${evt.data} </div>`);
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
    let service = document.querySelector('#service').value;
    let method = document.querySelector('#method').value;
    let args = JSON.parse(document.querySelector('#args').value);

    let req = request(`${service}/${method}`, args);
    req.setCallback(function (_data, _res) {
        console.log(_data);
        writeToScreen(`
        <div class="bg-success">
            <span class="small">(${_res.methodname})</span>
            ${JSON.stringify(_data)}
        </div>`);
    });
    doSend(req.toJson());
}

function request(...args) {
    let req = new JsonWspRequest(...args);
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
