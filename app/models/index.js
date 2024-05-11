const Sequelize = require("sequelize");
const CommunitiesModel = require("./communities");

const sequelize = new Sequelize("team_dynamics", "root", "root", {
  dialect: "mysql",
  host: "127.0.0.1",
  port: "3307"
});

const db = {
  sequelize,
  CommunitiesModel: CommunitiesModel(sequelize, Sequelize),
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = {
  sequelize,
  CommunitiesModel: db.CommunitiesModel,
};