// utils/logger.js
function log(...args) {
  console.log('[Backend1]', ...args);
}

function error(...args) {
  console.error('[Backend1 ERROR]', ...args);
}

module.exports = { log, error };
