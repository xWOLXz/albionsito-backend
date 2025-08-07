function logs(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 ${message}`);
  if (data !== null) {
    console.log(data);
  }
}

module.exports = logs;
