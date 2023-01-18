"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Results", "answerId", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("Results", {
      fields: ["answerId"],
      type: "foreign key",
      references: {
        table: "Answers",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Results", "answerId");
  },
};
