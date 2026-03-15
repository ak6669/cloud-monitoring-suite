const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../error.log');

function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  let errMsg = error.message || error.toString();
  // AWS SDK specific errors often have a Name or Code
  if (error.name) {
    errMsg = `${error.name}: ${errMsg}`;
  }
  const errorMessage = `${timestamp} - [${context}] - ERROR: ${errMsg}\n`;
  
  try {
    fs.appendFileSync(logPath, errorMessage, 'utf8');
  } catch (e) {
    // Failsafe if we can't write to error.log
    console.error('Failed to write to log file:', e);
  }
}

function logInfo(message, context = '') {
  const timestamp = new Date().toISOString();
  const infoMessage = `${timestamp} - [${context}] - INFO: ${message}\n`;
  
  try {
    fs.appendFileSync(logPath, infoMessage, 'utf8');
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

module.exports = {
  logError,
  logInfo
};
