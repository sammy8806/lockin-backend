'use strict';
require('babel-polyfill');
require('dotenv').config();
let config = require('./lib/config.js');
let helpers = require('./lib/helpers.js');
const childProcess = require('child_process');

const _env = helpers.setupEnv();

global._env = _env;

_env.debug('SYSTEM', `Running Node-Version ${process.version}`);
_env.debug(
    'SYSTEM',
    `Running GIT-Version: ${childProcess.spawnSync('git', ['log', '--pretty=format:\'%H\'', '-n 1']).stdout}`
);

_env.websockethandler.init(_env, config.server.port, config.server.host);

// -------------------
