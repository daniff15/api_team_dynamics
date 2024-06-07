const { GamesModel, GameBossesModel, BossesModel, TeamsModel, CharactersModel, TeamPlayersModel } = require('../models/index');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const gamesBosses = require('../models/gamesBosses');
const { constructCharacterResponse, includePlayerAssociationsOutsideTeamPlayer, includeCharacterAssociationsOutsideTeam, includePlayerAssociationsInsideTeam } = require('../utils/characters');
const { simulateBattles } = require('../utils/battles');
const { Op } = require('sequelize');

const getAllGames = async () => {
    const games = await GamesModel.findAll({});
    return success(games);
};

const getGame = async (id) => {
    const game = await GamesModel.findByPk(id);

    if (!game) {
        return NotFoundError('Game Narrative not found');
    }

    const gameBosses = await GameBossesModel.findAll({
        where: {
            game_id: id
        }
    });

    const bosses = await BossesModel.findAll({
        where: {
            id: gameBosses.map(gameBoss => gameBoss.boss_id)
        },
        include: includePlayerAssociationsOutsideTeamPlayer()
    });

    const formattedBosses = bosses.map(boss => (
        constructCharacterResponse(boss)
    ));

    const data = {
        game: game,
        bosses: formattedBosses
    }

    return success(data);
}

const createGame = async (game) => {
    const newGame = await GamesModel.create(game);
    return success(newGame);
}

const postBossesToGame = async (gameId, bosses) => {
    const game = await GamesModel.findByPk(gameId);

    if (!game) {
        return NotFoundError('Game not found');
    }

    if (!bosses || bosses.length === 0) {
        return BadRequestError('No bosses provided');
    }

    for (const boss of bosses) {
        const existing_boss = await BossesModel.findByPk(boss);

        if (!existing_boss) {
            return BadRequestError(`Boss with id ${boss} does not exist`);
        }
    }

    const gameBosses = await GameBossesModel.findAll({
        where: {
            game_id: gameId
        }
    });

    const existingBossIds = gameBosses.map(gameBoss => gameBoss.boss_id);
    const existingBossConflicts = bosses.filter(bossId => existingBossIds.includes(bossId));
    if (existingBossConflicts.length > 0) {
        return ConflictError(`The following bosses are already associated with the game: ${existingBossConflicts.join(', ')}`);
    }

    // Filter new bosses to add
    const newBossIds = bosses.filter(bossId => !existingBossIds.includes(bossId));

    const newGameBosses = newBossIds.map(bossId => ({
        game_id: gameId,
        boss_id: bossId
    }));


    await GameBossesModel.bulkCreate(newGameBosses);

    return success(newGameBosses)
}

const getGameOdds = async (teamId) => {
    const team = await TeamsModel.findOne({
        where: { id: teamId },
        include: [
            {
                model: TeamPlayersModel,
                include: includePlayerAssociationsInsideTeam()
            }
        ]
    });

    if (!team) {
        return NotFoundError('Team not found');
    }

    const game = await GamesModel.findByPk(team.game_id);

    const gameBosses = await GameBossesModel.findAll({
        where: {
            game_id: game.id
        }
    });

    const winRates = [];

    for (const gameBoss of gameBosses) {
        const boss = await CharactersModel.findOne({
            where: { 
                id: gameBoss.boss_id,
                [Op.or]: [
                    { character_type_id: 2 },
                    { character_type_id: 3 }
                ]
            },
            include: includeCharacterAssociationsOutsideTeam()
        });

        const opponent = {
            character_id: boss.id,
            character_type: boss.character_type_id,
            character: boss
        };

        const winRate = await simulateBattles(team, opponent);
        winRates.push({ bossId: boss.id, winRate });
    }

    return success({ winRates });
};


const deleteGame = async (id) => {
    const result = await GamesModel.destroy({
        where: {
            id
        }
    });
    return result;
}

module.exports = {
    getAllGames,
    getGame,
    createGame,
    postBossesToGame,
    deleteGame,
    getGameOdds
};
