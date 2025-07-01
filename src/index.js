const AIClient = require("./AIClient");

module.exports = AIClient;

// For convenience, also export as default and named export
module.exports.AIClient = AIClient;
module.exports.default = AIClient;

// Backward compatibility
module.exports.DeepSeekClient = AIClient;

// Version info
module.exports.VERSION = "1.0.0";
