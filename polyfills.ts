// polyfills.ts
import 'react-native-get-random-values';

global.Buffer = require('buffer').Buffer;
global.process = require('process');
global.setImmediate = global.setImmediate || require('timers').setImmediate;

require('stream');
require('crypto');
require('util');
