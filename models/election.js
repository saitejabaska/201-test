"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here'
      Election.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
      Election.hasMany(models.Voter, {
        foreignKey: "electionId",
      });
      Election.hasMany(models.Result, {
        foreignKey: "electionId",
      });
    }
    static getElections(adminId) {
      return this.findAll({
        where: { adminId },
        order: [["createdAt", "DESC"]],
      });
    }
    static getElectionDetails(adminId, electionId) {
      return this.findOne({
        where: {
          [Op.and]: [{ adminId }, { id: electionId }],
        },
      });
    }

    static addElection({ title, adminId }) {
      return this.create({
        title: title,
        adminId,
        status: "created",
      });
    }
    updateElectionStatus() {
      return this.update({ status: "launched" });
    }
    static async deleteElection(id, adminId) {
      return this.destroy({
        where: {
          id,
          adminId,
        },
      });
    }
    updateElectionTitle(newTitle) {
      return this.update({ title: newTitle });
    }
  }
  Election.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      url: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
