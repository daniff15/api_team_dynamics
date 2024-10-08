require('dotenv').config();
const Sequelize = require("sequelize");
const AttacksModel = require("./attacks");
const AttributesModel = require("./attributes");
const BattlesModel = require("./battles");
const CharacterElementsModel = require("./characterElements");
const CharacterLevelAttributesModel = require("./characterLevelAttributes");
const CharactersModel = require("./characters");
const CharacterTypesModel = require("./characterTypes");
const ElementRelationshipsModel = require("./elementRelationships");
const ElementsModel = require("./elements");
const LevelsModel = require("./levels");
const TeamPlayersModel = require("./teamPlayers");
const TeamsModel = require("./teams");
const PlayersModel = require("./players");
const BossesModel = require("./bosses");
const GamesModel = require("./games");
const GameBossesModel = require("./gamesBosses");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'team_dynamics',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_ROOT_PASSWORD || 'password',
  {
    dialect: process.env.MYSQL_DIALECT || 'mysql',
    host: process.env.MYSQL_HOST || 'mysql',
    port: process.env.MYSQL_PORT || 3306,
  }
);

const db = {
  sequelize,
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
  TeamPlayersModel: TeamPlayersModel(sequelize, Sequelize),
  PlayersModel: PlayersModel(sequelize, Sequelize),
  BossesModel: BossesModel(sequelize, Sequelize),
  GameBossesModel: GameBossesModel(sequelize, Sequelize),
  GamesModel: GamesModel(sequelize, Sequelize)
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
  ElementRelationshipsModel: db.ElementRelationshipsModel,
  ElementsModel: db.ElementsModel,
  LevelsModel: db.LevelsModel,
  TeamPlayersModel: db.TeamPlayersModel,
  TeamsModel: db.TeamsModel,
  PlayersModel: db.PlayersModel,
  BossesModel: db.BossesModel,
  GameBossesModel: db.GameBossesModel,
  GamesModel: db.GamesModel
};