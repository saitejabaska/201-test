//import packages
const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");

const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const bcrypt = require("bcrypt");
const csurf = require("tiny-csrf");
// const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
dotenv.config({ path: "./config.env" });

//import files
const { Admin, Voter, Election, Question } = require("./models");
const initiatePassport = require("./auth/passport/index");
const authenticateJwt = require("./middelwares/authenticateJWT");

//import routes
const adminRoute = require("./routes/adminRoute");
const electionRoute = require("./routes/electionsRoute");
const questionsRoute = require("./routes/questionsRoute");
const answersRoute = require("./routes/answerRoute");
const votersRoute = require("./routes/votersRoute");

// create express application
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("process.env.SECRET_STRING"));
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  console.log("cookie", req.cookies);
  next();
});
app.use(csurf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    },
  })
);
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

//intialize passport
app.use(passport.initialize());
app.use(passport.session());

initiatePassport(passport);

passport.serializeUser((voter, done) => {
  console.log("Seralizing voter in session", voter.id);
  done(null, voter.id);
});

passport.deserializeUser((id, done) => {
  Voter.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => done(error, null));
});

//set default view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//render views

app.get("/", async (req, res) => {
  res.render("index", {
    title: "Online Voting Platform",
    csrfToken: req.csrfToken(),
  });
});
app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Sign Up",
    csrfToken: request.csrfToken(),
  });
});
app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.get("/voterLogin", async (req, res) => {
  //check if user is logged in
  // for this u need to have a middelware to return the userID
  res.render("voterLogin", {
    title: "Online Election Platform",
    csrfToken: req.csrfToken(),
  });
});

app.get("/vote", async (req, res) => {
  console.log("uff", req.user.id);

  const currentVoter = req.user.id;
  const adminId = req.user.adminId;
  const electionId = req.user.electionId;
  const election = await Election.getElectionDetails(adminId, electionId);
  const questions = await Question.getQuestions(adminId, election.id);
  //get id
  console.log({ adminId }, { questions }, { election });
  res.render("vote", {
    title: "Online Election Platform",
    csrfToken: req.csrfToken(),
    election,
    currentVoter,
    // questions,
  });
});
//register user
app.post("/admins", async (request, response) => {
  const { firstName, lastName, email, password } = request.body;
  const hashedPwd = await bcrypt.hash(password, 10);
  //create user
  try {
    const user = await Admin.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPwd,
    });
    request.logIn(user, (err) => {
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
});

//login user
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/voterLogin",
    failureFlash: true,
  }),
  async (request, response) => {
    //const { email, password } = request.body;
    //console.log(request.user.id);

    response.redirect(`/elections/${global.voterUrl}/vote`);
  }
);
//sign out user
app.get("/signout", (request, response, next) => {
  response.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  // res.status(200).json({ status: "success" });
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

//routes
app.use("/admins", adminRoute);
app.use("/elections", electionRoute);
app.use("/questions", authenticateJwt, questionsRoute);
app.use("/answers", authenticateJwt, answersRoute);
app.use("/voters", authenticateJwt, votersRoute);

//export application
module.exports = app;
