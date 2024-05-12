const Sequelize = require("sequelize");
const AttacksModel = require("./attacks");
const AttributesModel = require("./attributes");
const BattlesModel = require("./battles");
const CharacterElementsModel = require("./characterElements");
const CharacterLevelAttributesModel = require("./characterLevelAttributes");
const CharactersModel = require("./characters");
const CharacterTypesModel = require("./characterTypes");
const CommunitiesModel = require("./communities");
const ElementRelationshipsModel = require("./elementRelationships");
const ElementsModel = require("./elements");
const LevelsModel = require("./levels");
const TeamCharactersModel = require("./teamCharacters");
const TeamsModel = require("./teams");

const sequelize = new Sequelize("team_dynamics", "root", "root", {
  dialect: "mysql",
  host: "127.0.0.1",
  port: 3307
});

const db = {
  sequelize,
  CommunitiesModel: CommunitiesModel(sequelize, Sequelize),
  ElementsModel: ElementsModel(sequelize, Sequelize),
  AttributesModel: AttributesModel(sequelize, Sequelize),
  CharacterTypesModel: CharacterTypesModel(sequelize, Sequelize),
  LevelsModel: LevelsModel(sequelize, Sequelize),
  TeamsModel: TeamsModel(sequelize, Sequelize),
  CharactersModel: CharactersModel(sequelize, Sequelize),
  BattlesModel: BattlesModel(sequelize, Sequelize),
  AttacksModel: AttacksModel(sequelize, Sequelize),
  CharacterElementsModel: CharacterElementsModel(sequelize, Sequelize),
  CharacterLevelAttributesModel: CharacterLevelAttributesModel(sequelize, Sequelize),
  ElementRelationshipsModel: ElementRelationshipsModel(sequelize, Sequelize),
  TeamCharactersModel: TeamCharactersModel(sequelize, Sequelize),
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = {
  sequelize,
  AttacksModel: db.AttacksModel,
  AttributesModel: db.AttributesModel,
  BattlesModel: db.BattlesModel,
  CharacterElementsModel: db.CharacterElementsModel,
  CharacterLevelAttributesModel: db.CharacterLevelAttributesModel,
  CharactersModel: db.CharactersModel,
  CharacterTypesModel: db.CharacterTypesModel,
  CommunitiesModel: db.CommunitiesModel,
  ElementRelationshipsModel: db.ElementRelationshipsModel,
  ElementsModel: db.ElementsModel,
  LevelsModel: db.LevelsModel,
  TeamCharactersModel: db.TeamCharactersModel,
  TeamsModel: db.TeamsModel
};