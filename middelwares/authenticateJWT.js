/**This middelware authenticates jwt token by fetching it from authorization headers or cookies */

const jwt = require("jsonwebtoken");

const authenticateJwt = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next("you are not logged in");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, verifiedJwt) => {
    if (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    } else {
      req.user = verifiedJwt.id;
      req.userType = verifiedJwt.userType;
      console.log(token);
      console.log("user", req.user, "userType", req.userType);
      // res.status(200).json({"token":verifiedJwt} )
      next();
    }
  });
};
module.exports = authenticateJwt;
