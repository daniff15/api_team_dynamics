const { GamesModel, GameBossesModel, BossesModel } = require('../models/index');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const gamesBosses = require('../models/gamesBosses');

const getAllGames = async () => {
    const games = await GamesModel.findAll({});
    return success(games);
};

const getGame = async (id) => {
    const game = await GamesModel.findByPk(id);

    if (!game) {
        return NotFoundError('Game Narrative not found');
    }

    return success(game);
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
    deleteGame
};
