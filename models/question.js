"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      Question.belongsTo(models.Election, {
        foreignKey: "electionId",
      });
      Question.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
      Question.hasMany(models.Answer, {
        foreignKey: "questionId",
      });
      Question.hasMany(models.Result, {
        foreignKey: "questionId",
      });
    }
    static addQuestion({ title, description, adminId, electionId }) {
      return this.create({
        title: title,
        adminId,
        description,
        electionId,
      });
    }
    static getQuestions(adminId, electionId) {
      return this.findAll({
        where: {
          [Op.and]: [{ adminId }, { electionId }],
        },
      });
    }

    static getQuestion(adminId, id) {
      return this.findOne({
        where: {
          [Op.and]: [{ adminId }, { id }],
        },
      });
    }
    static getQuestionsForVoting(electionId) {
      return this.findAll({ where: { electionId } });
    }
  }
  Question.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          // len: 2,
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, len: 5 },
      },
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
