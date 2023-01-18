const { Question, Election, Answer, Admin } = require("../models");

//create elections
exports.createQuestion = async (req, res) => {
  //get adminId from req.user
  //get electionId from req.params
  const { title, description, electionId } = req.body;

  try {
    const adminId = req.user;
    const question = await Question.addQuestion({
      title,
      description,
      adminId,
      electionId,
    });

    if (!question) {
      res.status(401).json({
        status: "fail",
        message: "Unable to create election",
      });
    }

    return res.redirect(`/questions/${question.id}`);
  } catch (error) {
    console.log(error.message);
    if (error.name === "SequelizeValidationError") {
      for (var key in error.errors) {
        console.log(error.errors[key].message);

        if (
          error.errors[key].message === "Validation notEmpty on title failed"
        ) {
          req.flash("error", "Title can't be empty");
        }
        if (
          error.errors[key].message === "Validation len on description failed"
        ) {
          req.flash("error", "Description must atleaset have 5 characters");
        }
      }
    }
    res.redirect(`/elections/${electionId}/questions/new`);
  }
};

//render questions details page
//question details page
exports.renderQuesDetailsPAge = async (request, response) => {
  const adminId = request.user;
  const id = request.params.id;
  // const admin = await Admin.getAdminDetails(loggedInUser);
  const question = await Question.getQuestion(adminId, id);
  const questionId = id;
  const electionId = question.electionId;

  const election = await Election.getElectionDetails(adminId, electionId);
  const answers = await Answer.getAnswers({ adminId, questionId });
  const admin = await Admin.findByPk(adminId);
  response.render("questionDetailsPage", {
    title: "Online Voting Platform",
    //admin,
    election,
    question,
    answers,
    admin,
    csrfToken: request.csrfToken(),
  });
};
