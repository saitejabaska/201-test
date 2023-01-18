const jwt = require("jsonwebtoken");
const { Admin } = require("../models");
const { generateJwtToken, generateHashedPassword } = require("../utils");

const protect = async (req, res, next) => {
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

//register admin
const register = async (request, response) => {
  const { firstName, lastName, email, password } = request.body;
  const hashedPwd = await generateHashedPassword(password);
  //create user
  try {
    const admin = await Admin.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPwd,
    });
    const token = generateJwtToken(admin.id, "admin");
    const cookieOPtions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    if (process.env.NODE_ENV == "production") cookieOPtions.secure = true;

    response.cookie("jwt", token, cookieOPtions);

    request.logIn(admin, (err) => {
      if (err) {
        console.log("from", err);
      }
      response.redirect("/elections");
    });
  } catch (error) {
    console.log(error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      request.flash("error", "Email already exists");
      response.redirect("/signup");
    }
    if (error.name === "SequelizeValidationError") {
      for (var key in error.errors) {
        console.log(error.errors[key].message);
        if (
          error.errors[key].message === "Validation len on firstName failed"
        ) {
          request.flash(
            "error",
            "First name must have minimum of 2 characters"
          );
        }
        if (error.errors[key].message === "Validation len on lastName failed") {
          request.flash("error", "Last name must have minimum of 2 characters");
        }
        if (
          error.errors[key].message === "Validation isEmail on email failed"
        ) {
          request.flash("error", "Invalid Email");
        }
        if (error.errors[key].message === "Email address already in use!") {
          request.flash("error", "Email address already in use!");
        }
      }
      //   response.redirect("/todos");
      response.redirect("/signup");
    }
  }
};

// login
const login = async (request, response) => {
  const { email, password } = request.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      request.flash("error", "No user found");
    }
    const passWordCorrect = await generateHashedPassword(
      password,
      admin.password
    );
    if (!passWordCorrect) {
      request.flash("error", "Incorrect password");
    }
    const token = generateJwtToken(admin.id, "voter");

    const cookieOPtions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    if (process.env.NODE_ENV == "production") cookieOPtions.secure = true;

    response.cookie("jwt", token, cookieOPtions);
    request.logIn(admin, (err) => {
      if (err) {
        console.log("from", err);
      }
      response.redirect("/elections");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  // res.status(200).json({ status: "success" });
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
module.exports = {
  protect,
  login,
  register,
  logout,
};
