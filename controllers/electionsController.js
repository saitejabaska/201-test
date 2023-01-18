const { Election, Admin, Voter, Question } = require("../models");

//get elections
exports.getElections = async (req, res) => {
  const loggedInUser = req.user;
  const electionss = await Election.getElections(loggedInUser);
  if (req.accepts("html")) {
    res.render("elections", {
      electionss,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      electionss,
    });
  }
};
//create elections
exports.createElection = async (req, res) => {
  try {
    const { title } = req.body;
    const adminId = req.user;
    const election = await Election.addElection({
      title: title,
      status: "created",
      adminId,
    });
    if (!election) {
      res.status(401).json({
        status: "fail",
        message: "Unable to create election",
      });
    }
    return res.redirect(`/elections/${election.id}`);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      for (var key in error.errors) {
        console.log(error.errors[key].message);

        if (
          error.errors[key].message === "Validation notEmpty on title failed"
        ) {
          req.flash("error", "Title can't be empty");
        }
      }
    }
    res.redirect("/elections/createElections/new");
  }
};

//change the status of election to launch election
exports.launchElection = async (req, res) => {
  const electionId = req.params.id;
  try {
    const election = await Election.findByPk(electionId);
    console.log({ election });
    const updatedElection = await election.updateElectionStatus();
    if (!updatedElection) {
      console.log("error");
    }
    console.log(updatedElection);
    return res.json(updatedElection);
  } catch (error) {
    console.log(error.message);
    res.status(501).json({
      status: "fail",
      message: error.message,
    });
  }
};
//delete election
exports.deleteElection = async (req, res) => {
  const electionId = req.params.id;
  const adminId = req.user;
  console.log(adminId);
  try {
    await Election.deleteElection(electionId, adminId);
    return res.json(true);
  } catch (error) {
    console.log(error.message);
    req.flash("error", "Can't process you request");
  }
};

//edit election
exports.updateElectionTitle = async (req, res) => {
  const { title } = req.body;
  const id = req.params.id;

  try {
    const election = Election.findByPk(id);
    const updatedElection = await election.updateElectionTitle(title);
    res.json(updatedElection);
  } catch (error) {
    console.log(error.message);
    req.flash("error", "Can't process you request");
  }
};

//render elections page
exports.renderElectionsPage = async (request, response) => {
  const loggedInUser = request.user;
  const admin = await Admin.getAdminDetails(loggedInUser);
  const elections = await Election.getElections(loggedInUser);
  if (request.accepts("html")) {
    response.render("elections", {
      title: "Online Voting Platform",
      admin,
      elections,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      elections,
    });
  }
};

//create election page
exports.renderCreateElecPage = async (request, response) => {
  const loggedInUser = request.user;
  const admin = await Admin.getAdminDetails(loggedInUser);
  response.render("createElections", {
    title: "Create Elections",
    admin,
    csrfToken: request.csrfToken(),
  });
};

//election details page
exports.renderElectionDetailsPage = async (request, response) => {
  const loggedInUser = request.user;
  const id = request.params.id;
  const admin = await Admin.getAdminDetails(loggedInUser);
  const questions = await Question.getQuestions(loggedInUser, id);
  const election = await Election.getElectionDetails(loggedInUser, id);
  const electionId = election.id;

  const voters = await Voter.getVoters(electionId);
  request.voterUrl = electionId;
  if (request.accepts("html")) {
    response.render("electionDetailsPage", {
      title: "Election Details",
      admin,
      election,
      questions,
      voters,

      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      election,
    });
  }
};

// manage questions page
exports.renderManageQuesPage = async (request, response) => {
  const loggedInUser = request.user;
  const id = request.params.id;
  const admin = await Admin.getAdminDetails(loggedInUser);
  const questions = await Question.getQuestions(loggedInUser, id);
  const election = await Election.getElectionDetails(loggedInUser, id);

  response.render("manageQuestions", {
    title: "Online Voting Platform",
    admin,
    election,
    questions,
    csrfToken: request.csrfToken(),
  });
};

//create questions page
exports.renderCreateQuesPage = async (request, response) => {
  const id = request.params.id;
  const loggedInUser = request.user;
  const admin = await Admin.getAdminDetails(loggedInUser);
  const election = await Election.getElectionDetails(loggedInUser, id);
  console.log({ election });
  response.render("createQuestions", {
    title: "Create Questions",
    election,
    admin,
    csrfToken: request.csrfToken(),
  });
};
//create questions page
exports.renderVotingPage = async (request, response) => {
  const id = request.params.id;
  const loggedInUser = request.user;
  const admin = await Admin.getAdminDetails(loggedInUser);
  const election = await Election.getElectionDetails(loggedInUser, id);
  // const ques = await Answer.findAll({
  //   include: [
  //     {
  //       model: Question,
  //       required: true,
  //     },
  //   ],
  //   where: {
  //     questionId,
  //   },
  // });
  // console.log(ques)
  //election
  //question
  //answer
  //voterId
  console.log({ election });
  request.voterUrl = id;
  response.render("vote", {
    title: "Online Voting Platform",
    election,
    admin,
    csrfToken: request.csrfToken(),
  });
};
