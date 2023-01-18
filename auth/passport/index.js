const localStrategy = require("./localStrategy");
const jwtStrategy = require("./jwtStrategy");

const initiatePassport = (passport) => {
  passport.use(localStrategy);
  // passport.use(jwtStrategy);
};

module.exports = initiatePassport;
