const { GamesModel } = require('../models/index');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');

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
    deleteGame
};
