const UAParser = require("ua-parser-js");

const detectDevice = (req, res, next) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  req.deviceInfo = {
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type || "desktop",
  };

  next();
};

module.exports = detectDevice;