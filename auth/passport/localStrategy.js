const bcrypt = require("bcrypt");
const localStrategy = require("passport-local");

const { Voter } = require("../../models");
const strategy = new localStrategy(
  {
    usernameField: "voter_Id",
    passwordField: "password",
  },
  (voter_Id, password, done) => [
    Voter.findOne({ where: { voter_Id: voter_Id } })
      .then(async (voter) => {
        if (!voter) {
          return done(null, false, { message: "No Voter found" });
        }
        const result = await bcrypt.compare(password, voter.password);
        if (result) {
          return done(null, voter);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      })
      .catch((error) => {
        return done(error);
      }),
  ]
);
module.exports = strategy;
