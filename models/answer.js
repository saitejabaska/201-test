"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      // define association here
      Answer.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
      Answer.belongsTo(models.Question, {
        foreignKey: "questionId",
      });
      Answer.hasMany(models.Result, {
        foreignKey: "answerId",
      });
    }
    static addAnswers({ adminId, content, questionId }) {
      return this.create({
        adminId,
        content,
        questionId,
      });
    }
    static getAnswers({ adminId, questionId }) {
      return this.findAll({
        where: {
          [Op.and]: [{ questionId }, { adminId }],
        },
      });
    }
    static getAnsWithQuestion(questionId) {
      return this.findAll({
        include: [
          {
            model: Question,
            required: true,
          },
        ],
        where: {
          questionId,
        },
      });
    }
  }
  Answer.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
          len: 3,
        },
      },
    },
    {
      sequelize,
      modelName: "Answer",
    }
  );
  return Answer;
};
