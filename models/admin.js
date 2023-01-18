"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      Admin.hasMany(models.Election, {
        foreignKey: "adminId",
      });
      Admin.hasMany(models.Question, {
        foreignKey: "adminId",
      });
      Admin.hasMany(models.Answer, {
        foreignKey: "adminId",
      });
      Admin.hasMany(models.Voter, {
        foreignKey: "adminId",
      });
    }

    static async getAdminDetails(id) {
      return Admin.findByPk(id);
    }
    static async getAllAdmins() {
      return Admin.findAll();
    }
  }
  Admin.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 2,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 2,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          isEmail: true,
          isUnique: (value, next) => {
            Admin.findAll({
              where: { email: value },
              attributes: ["id"],
            })
              .then((user) => {
                if (user.length != 0)
                  next(new Error("Email address already in use!"));
                next();
              })
              .catch((onError) => console.log(onError));
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  return Admin;
};
