const { GamesModel, GameBossesModel, BossesModel, TeamsModel, CharactersModel, TeamPlayersModel, BattlesModel } = require('../models/index');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const gamesBosses = require('../models/gamesBosses');
const { constructCharacterResponse, includePlayerAssociationsOutsideTeamPlayer, includeBossesAssociations, includePlayerAssociationsInsideTeam } = require('../utils/characters');
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
    let {name, start_date, end_date, status} = game;
    const nowDate = new Date();

    if (!name) {
        return BadRequestError('Name is required');
    }

    if (!start_date && !status) {
        status = true;
    }

    if (start_date && !status) {
        if (new Date(start_date) <= nowDate) {
            status = true;
        } else {
            status = false
        }
    }

    if (end_date && new Date(end_date) < nowDate) {
        return BadRequestError('End date cannot be smaller than current date or start date');
    }

    const newGame = await GamesModel.create({
        name,
        start_date,
        end_date,
        status
    });
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
            return NotFoundError(`Boss with id ${boss} does not exist`);
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
        game_id: parseInt(gameId),
        boss_id: parseInt(bossId)
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
            include: includeBossesAssociations()
        });

        const opponent = {
            character_id: boss.id,
            character_type: boss.character_type_id,
            character: boss
        };

        const winRate = await simulateBattles(team, opponent);
        winRates.push({ boss_id: boss.id, win_rate: winRate });
    }

    return success(winRates);
};

const checkNarrativeStatus = async (teamId) => {
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

    const defeatedBosses = await BattlesModel.findAll({
        where: {
            team_id: teamId,
            boss_id: gameBosses.map(gameBoss => gameBoss.boss_id),
            winner_id: teamId
        }
    });

    const defeatedBossIds = Array.from(new Set(defeatedBosses.map(battle => battle.boss_id)));
    const allBossesDefeated = gameBosses.length === defeatedBossIds.length;

    return success({
        game_id: game.id,
        narrative_completed: allBossesDefeated,
        defeated_boss_ids: defeatedBossIds,
        remaining_boss_ids: gameBosses.filter(gameBoss => !defeatedBossIds.includes(gameBoss.boss_id)).map(gameBoss => gameBoss.boss_id)
    });
};

const updateGame = async (gameId, game) => {
    const existingGame = await GamesModel.findByPk(gameId);

    if (!existingGame) {
        return NotFoundError('Game not found');
    }

    const { name, start_date, end_date, status } = game;

    if (!name && !start_date && !end_date && !status) {
        return BadRequestError('No fields to update');
    }

    if (name) {
        existingGame.name = name;
    }

    if (start_date) {
        existingGame.start_date = start_date;
    }

    if (end_date) {
        existingGame.end_date = end_date;
    }

    if (status !== undefined) {
        existingGame.status = status;
    }

    //check if end_date is smaller than start_date
    if (end_date && start_date && new Date(end_date) <= new Date(start_date)) {
        return BadRequestError('End date cannot be smaller or equal than start date');
    }

    await existingGame.save();

    return success(existingGame);
};

const deleteGame = async (gameId) => {
    const existingGame = await GamesModel.findByPk(gameId);

    if (!existingGame) {
        return NotFoundError('Game not found');
    }

    await existingGame.destroy();

    return success({}, message = 'Game deleted successfully');
};

const deleteBossesFromGame = async (gameId, bosses) => {
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
            return NotFoundError(`Boss with id ${boss} does not exist`);
        }
    }

    const gameBosses = await GameBossesModel.findAll({
        where: {
            game_id: gameId
        }
    });

    const existingBossIds = gameBosses.map(gameBoss => gameBoss.boss_id);
    const existingBossConflicts = bosses.filter(bossId => !existingBossIds.includes(bossId));
    if (existingBossConflicts.length > 0) {
        return BadRequestError(`The following bosses are not associated with the game: ${existingBossConflicts.join(', ')}`);
    }

    // Filter new bosses to add
    const newBossIds = bosses.filter(bossId => existingBossIds.includes(bossId));

    const newGameBosses = newBossIds.map(bossId => ({
        game_id: parseInt(gameId),
        boss_id: parseInt(bossId)
    }));

    await GameBossesModel.destroy({
        where: {
            [Op.and]: [
                { game_id: gameId },
                { boss_id: newBossIds }
            ]
        }
    });

    return success(newGameBosses)
}

module.exports = {
    getAllGames,
    getGame,
    createGame,
    postBossesToGame,
    getGameOdds,
    checkNarrativeStatus,
    updateGame,
    deleteGame,
    deleteBossesFromGame
};
