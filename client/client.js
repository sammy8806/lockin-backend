'use strict';

let wsUri = 'ws://localhost:8080/';
let output;
let last = 0;
let requests = new Map();
let requestCallbacks = new Map();

let websocketOpen = false;

function debug(...args) {
    console.log(...args);
}

class JsonWspRequest { // aka jsonwsp/request
    constructor(method, args, mirror = null) {
        this.type = 'jsonwsp/request';
        this.version = '1.0';

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
        if (typeof data === 'string')
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
    output = document.getElementById('output');

    document.querySelector('#send').onclick = function () {
        let service = document.querySelector('#service').value;
        let method = document.querySelector('#method').value;
        let args = JSON.parse(document.querySelector('#args').value);

        let callback = function (_data, _res) {
            console.log(_data);
            writeToScreen(`
        <div class="bg-success">
            <span class="small">(${_res.methodname})</span>
            ${JSON.stringify(_data)}
        </div>`);
        };

        doSocketStuff(() => sendRequest(service, method, args, callback));
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
        let user = document.querySelector('#register-mail').value;
        let pass = document.querySelector('#register-pass').value;
        let args = {mail: user, passwordHash: pass};

        let callback = function (_data, _res) {
            console.log(_data);
            writeToScreen(`<div class="bg-success"><span class="small">Register success</span></div>`);
        };

        doSocketStuff(() => sendRequest('userservice', 'register', args, callback));
    };

    document.querySelector('#login').onclick = function () {
        let user = document.querySelector('#login-mail').value;
        let pass = document.querySelector('#login-pass').value;
        let args = {mail: user, passwordHash: pass};

        let callback = function (_data, _res) {
            writeToScreen(`<div class="bg-success"><span class="small">Login success</span></div>`);
        };

        doSocketStuff(() => sendRequest('sessionservice', 'login', args, callback));
    };

    document.querySelector('#logout').onclick = function () {
        let callback = function (_data, _res) {
            writeToScreen(`<div class="bg-success"><span class="small">Logout success</span></div>`);
        };

        doSocketStuff(() => sendRequest('sessionservice', 'logout', {}, callback));
    };

    setInterval(() => {
        if (websocketOpen) {
            sendRequest('adminservice', 'getSessionStatus', {}, (_data, _res) => {
                console.log(JSON.stringify(_data));

                displaySessionData(_data.sessionId, _data.userId);
            });
        }
    }, 1000);

}

function displaySessionData(_sessionId, _userId) {
    document.querySelector('#session-id').innerHTML = _sessionId;
    document.querySelector('#user-id').innerHTML = _userId;
}

let websocket = null;
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
        const type = JSON.parse(evt.data).type;

        if (type === 'jsonwsp/response') {
            const res = new JsonWspResponse(evt.data);
            const _ref = res.reflection;
            const _req = requests.get(_ref);
            const _cb = _req.getCallback();
            _cb(res.result, res);
        } else if (type === 'jsonwsp/fault') {
            const res = new JsonWspFault(evt.data);
            const _ref = res.reflection;
            const _req = requests.get(_ref);

            if (_req.methodname === 'adminservice/getSessionStatus') {
                console.log('Request session status');
                return;
            }

            writeToScreen(`
            <div class="bg-danger">
                ${_req.methodname}:
                ${res.fault.code} - ${res.fault.string}
            </div>
            `);
        } else if (type === 'jsonwsp/request') {
            const res = new JsonWspRequest(evt.data);
            const _ref = res.reflection;
            const _req = requests.get(_ref);

            writeToScreen(`
            <div class="bg-info">
                ${_req.methodname}: ${JSON.stringify(_req.args)}
            </div>
            `);
        } else {
            console.log(evt.data);
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
    let pre = document.createElement('p');
    pre.style.wordWrap = 'break-word';
    pre.innerHTML = message;

    let firstChild = output.firstChild;
    output.insertBefore(pre, output.firstChild);
}

function sendRequest(service, method, args, callback) {
    let req = request(`${service}/${method}`, args);
    req.setCallback(callback);
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

    if (!websocketOpen) {
        testWebSocket();
    } else {
        writeToScreen(`<small><div class="bg-danger">Please <b>close</b> the Connection first!</div></small>`);
    }
}

function doSocketStuff(_cb) {
    if (websocketOpen) {
        _cb();
    } else {
        writeToScreen(`<small><div class="bg-danger">Please <b>open</b> the Connection first!</div></small>`);
    }
}

function killConnection() {
    websocket.close();
}

window.addEventListener('load', init, false);
