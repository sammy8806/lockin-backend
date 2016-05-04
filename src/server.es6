'use strict';
require('babel-polyfill');
require('dotenv').config();
let config = require('./lib/config.js');
let helpers = require('./lib/helpers.js');

const _env = helpers.setupEnv();

global._env = _env;

_env.websockethandler.init(_env, config.server.port, config.server.host);

// -------------------
