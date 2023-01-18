const { use } = require("passport");
const { Voter, Election, Question, Answer, Result } = require("../models");
const { generateHashedPassword } = require("../utils/index");

exports.addVoters = async (req, res) => {
  const { voter_Id, password } = req.body;
  const electionId = req.params.id;
  const hashedPassword = await generateHashedPassword(password);

  try {
    //check if voter already exists
    // const voterExists = await Voter.findOne({ where: { voter_Id } });
    // if (voterExists) {
    //   console.log("voter exists");
    //   req.flash("voter already exists");
    //   return res.redirect(`/elections/${electionId}/voters`);
    // }
    const adminId = req.user;
    const voter = await Voter.addVoter({
      electionId,
      voter_Id,
      password: hashedPassword,
      adminId,
    });
    if (!voter) {
      res.status(401).json({ status: "fail", message: "Unable to add voter" });
    }
    console.log({ adminId }, voter);
    return res.redirect(`/elections/${electionId}/voters`);
  } catch (error) {
    console.log(error.message);
    if (error.name === "SequelizeValidationError") {
      for (var key in error.errors) {
        console.log(error.errors[key].message);

        if (
          error.errors[key].message === "Validation notEmpty on voter_Id failed"
        ) {
          req.flash("error", "Username can't be empty");
        }
        if (error.errors[key].message === "Voter Id must be unique") {
          req.flash("error", "Voter Id must be unique");
        }
      }
      res.redirect(`/elections/${electionId}/voters`);
    }
  }
};
exports.getVoters = async (req, res) => {
  const electionId = req.params.id;
  const voters = await Voter.getVoters(electionId);
  const adminId = req.user;
  const election = await Election.getElectionDetails(adminId, electionId);
  if (req.accepts("html")) {
    res.render("displayVoters", {
      voters,
      election,
      title: "Online Voting Platform",
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      voters,
    });
  }
};

exports.renderVotersPage = async (req, res) => {
  const electionId = req.params.id;
  const voters = await Voter.getVoters(electionId);
  const adminId = req.user;
  const election = await Election.getElectionDetails(adminId, electionId);
  if (req.accepts("html")) {
    res.render("displayVoters", {
      voters,
      election,
      title: "Online Voting Platform",
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      voters,
    });
  }
};
exports.saveVotes = async (req, res) => {
  //fetch all data from req.body
  const { ["electionId"]: electionId, ...rest } = req.body;
  const voter_Id = req.user?.id;
  //check if the voter has already voted
  const userVoted = await Result.checkVoterStatus({ electionId, voter_Id });
  if (userVoted) {
    res.json("U have already voted");
    //redirect to voted page
  }
  //create results for each submission
  await Promise.all(
    Object.keys(rest).map(async (key) => {
      await Result.addVotingResult({
        questionId: key,
        answerId: rest[key],
        electionId: electionId,
        voter_Id: voter_Id,
      });
    })
  );
  const result = await Result.findAll({ raw: true });
  console.log(result);
  res.redirect("back");
};
exports.vote = async (req, res) => {
  const currentVoter = req.user.id;
  const adminId = req.user.adminId;
  const electionId = req.user.electionId;
  let answersWithQuestion = [];
  let filteredAnswers = [];
  // const userVoted = await Result.checkVoterStatus({ electionId, currentVoter });
  // console.log(userVoted);
  // if (userVoted) {
  //   //redirect to voted page
  //   res.redirect(`/elections/:${global.voterUrl}/vote`);
  // }

  //check if the voter is registered for the current election
  if (req.params.id != electionId) {
    //todo add flash
    return res.json("go away");
  }
  const election = await Election.getElectionDetails(adminId, electionId);
  const questions = await Question.getQuestions(adminId, electionId);

  //include questions table to answers (inner join)
  for (var i in questions) {
    answersWithQuestion.push(
      await Answer.findAll({
        where: { questionId: questions[i].id },
        include: [
          {
            model: Question,
            required: true,
          },
        ],
      })
    );
  }

  //extract the anwsers from the given data it's in [[{}],[{}]] format
  for (var l = 0; l < answersWithQuestion.length; l++) {
    for (var j = 0; j < answersWithQuestion[l].length; j++) {
      var innerValue = answersWithQuestion[l][j];
      filteredAnswers.push(innerValue);
    }
  }

  //parse the data
  let stringifiedData = JSON.stringify(filteredAnswers);
  let parsedData = JSON.parse(stringifiedData);

  //group by question id
  const groupedByQuestion = parsedData.reduce((accumulate, current) => {
    const questionId = current?.Question?.id;
    const existing = accumulate.findIndex((item) => item.id === questionId);
    // eslint-disable-next-line no-unused-vars
    const { ["Question"]: Question, ...answer } = current; // removes the question from the obj
    if (existing !== -1) {
      accumulate[existing].answers.push(answer);
    } else {
      accumulate.push({ ...current.Question, answers: [answer] });
    }
    return accumulate;
  }, []);

  if (req.accepts("html")) {
    res.render("vote", {
      title: "Online Voting Platform",
      csrfToken: req.csrfToken(),
      election,
      currentVoter,
      groupedByQuestion,
    });
  } else {
    res.json({
      // election,
      l: "ji",
    });
  }
};
