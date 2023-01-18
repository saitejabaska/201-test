const passportJwt = require("passport-jwt");
const EXtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const { Voter, Admin } = require("../../models");
const strategy = new StrategyJwt(
  {
    jwtFromRequest: EXtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      let user;
      if (jwtPayload.userType == "voter") {
        user = await Voter.findOne({ where: { id: jwtPayload.id } });
      } else {
        user = await Admin.findOne({ where: { id: jwtPayload.id } });
      }
      if (!user) {
        console.log("Ünauthorized");
        return done(null, false, { message: "unauthorized" });
      }
      return done(null, user);
    } catch (error) {
      console.log(error.message);
    }
  }
);
module.exports = strategy;
