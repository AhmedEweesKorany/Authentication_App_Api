const allowedOrgins = require("./allowedOrgins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrgins.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    }
    return callback(new Error("not allowed by CORS"),null);
  },
  Credential: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
