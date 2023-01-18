"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Result extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Result.belongsTo(models.Voter, {
        foreignKey: "voter_Id",
      });
      Result.belongsTo(models.Question, {
        foreignKey: "questionId",
      });
      Result.belongsTo(models.Election, {
        foreignKey: "electionId",
      });
      Result.belongsTo(models.Answer, {
        foreignKey: "answerId",
      });
    }
    static checkVoterStatus({ electionId, voter_Id }) {
      this.findOne({
        where: {
          [Op.and]: [{ electionId }, { voter_Id }],
        },
      });
    }
    static addVotingResult({ questionId, answerId, electionId, voter_Id }) {
      return this.create({ questionId, answerId, electionId, voter_Id });
    }
  }
  Result.init(
    {
      voterName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Result",
    }
  );
  return Result;
};
