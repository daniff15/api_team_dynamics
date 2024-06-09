const { TeamsModel, TeamPlayersModel, CharactersModel, GamesModel } = require('../models/index');
const { includePlayerAssociationsInsideTeam, constructCharacterResponse } = require('../utils/characters');
const { BadRequestError, NotFoundError, ServerError, ConflictError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const { Op } = require('sequelize');

const getAllTeams = async (game_id, orderByTotalXP = 'DESC') => {

    const queryOptions = {
        where: {},
        order: [['total_xp', orderByTotalXP]] 
    };

    if (game_id) {
        const game = await GamesModel.findOne({ where: { id: game_id } });
        if (!game) {
            return NotFoundError('Game Narrative not found');
        }
        queryOptions.where.game_id = game_id;
    }

    const teams = await TeamsModel.findAll(queryOptions);
    return success(teams);
};

const getTeam = async (id) => {
    const teamsData = await TeamsModel.findOne({
        where: { id: id },
        include: [
            {
                model: TeamPlayersModel,
                include: includePlayerAssociationsInsideTeam()
            }
        ]
    });

    if (!teamsData) {
        return NotFoundError('Team not found');
    }

    const teamData = {
        id: teamsData.id,
        community_id_ext: teamsData.community_id_ext,
        game_id: teamsData.game_id,
        owner_id: teamsData.owner_id,
        name: teamsData.name,
        total_xp: teamsData.total_xp,
        team_image_path: teamsData.team_image_path,
        cooldown_time: teamsData.cooldown_time,
        members: []
    };

    teamsData.team_players.forEach(teamPlayer => {
        const player = teamPlayer.player;
        teamData.members.push(constructCharacterResponse(player));
    });

    return success(teamData);
};

const createTeam = async (team) => {
    const game = await GamesModel.findByPk(team.game_id);
    if (!game) {
        return NotFoundError('Game Narrative not found');
    }

    const existingTeam = await TeamsModel.findOne({
        where: {
            name: team.name,
            game_id: team.game_id
        }
    });

    if (existingTeam) {
        return ConflictError('A Team with the same name already exists in this game!');
    }

    const owner = team.owner_id;
    const player = await CharactersModel.findByPk(owner);
    if (!player) {
        return NotFoundError('Player not found.');
    }

    if(player.character_type_id !== 1) {
        return BadRequestError('Impossible to create a team, player is not a player character.');
    }

    if (player.level_id !== 1) {
        return BadRequestError('Impossible to create a team, player is not at default stats or level.');
    }

    const playerInATeam = await TeamPlayersModel.findOne({ where: { player_id: player.id } });

    if (playerInATeam) {
        return ConflictError('Player is already a member of a team. Create a new player to create a new team or leave the current team (Your stats will be reseted).');
    }

    const newTeam = await TeamsModel.create(team);
    await TeamPlayersModel.create({ team_id: newTeam.id, player_id: owner });

    return success(newTeam);
}

const deleteTeam = async (id) => {
    if (!id) {
        return BadRequestError('Team ID is required');
    }

    const team = await TeamsModel.findByPk(id);
    if (!team) {
        return NotFoundError('Team not found');
    }

    const teamPlayers = await TeamPlayersModel.findAll({ where: { team_id: id } });
    for (let i = 0; i < teamPlayers.length; i++) {
        const player = await CharactersModel.findByPk(teamPlayers[i].player_id);
        await player.destroy();
    }

    const result = await TeamsModel.destroy({
        where: {
            id
        }
    });
    return success(result, message = 'Team deleted successfully');
}

const addCharacterToTeam = async (teamId, characterId) => {
    try {
        const team = await TeamsModel.findByPk(teamId);
        if (!team) {
            return NotFoundError('Team not found');
        }

        const teamInSameGame = await TeamsModel.findOne({
            where: { game_id: team.game_id },
            include: [{ model: TeamPlayersModel, where: { player_id: characterId } }]
        });
        if (teamInSameGame) {
            return ConflictError('Character is already a member of a team in the same game narrative');
        }

        const currentMembersCount = await TeamPlayersModel.count({ where: { team_id: teamId } });
        if (currentMembersCount >= 4) {
            return BadRequestError('Team is already full (4 members max).');
        }

        const existingMember = await TeamPlayersModel.findOne({ where: { team_id: teamId, player_id: characterId } });
        if (existingMember) {
            return ConflictError('Character is already a member of the team.');
        }

        const character = await CharactersModel.findByPk(characterId);
        if (!character) {
            return NotFoundError('Character not found.');
        }

        if (character.level_id !== 1) {
            return BadRequestError('Impossible to add that player to a team, player is not at default stats or level.');
        }

        const result = await TeamPlayersModel.create({ team_id: teamId, player_id: characterId });
        return success(result, message = 'Character added to team');
    } catch (error) {
        return ServerError(error.message);
    }
};

const updateTeam = async (teamId, updates) => {
    const team = await TeamsModel.findByPk(teamId);
    if (!team) {
        return NotFoundError('Team not found');
    }

    const allowedUpdates = {
        name: updates.name
    };

    const updatedFields = {};
    Object.entries(allowedUpdates).forEach(([key, value]) => {
        if (value !== undefined) {
            updatedFields[key] = value;
        }
    });


    if (Object.keys(updatedFields).length === 0) {
        return BadRequestError('No valid fields to update');
    }

    await TeamsModel.update(updatedFields, { where: { id: teamId } });

    const updatedTeam = await TeamsModel.findByPk(teamId);
    if (!updatedTeam) {
        return NotFoundError('Team not found');
    }

    return success(updatedTeam, message = 'Team updated successfully');
};

const leaveTeam = async (playerId) => {
    const player = await CharactersModel.findByPk(playerId);
    if (!player) {
        return NotFoundError('Player not found');
    }

    const teamPlayer = await TeamPlayersModel.findOne({ where: { player_id: playerId } });
    if (!teamPlayer) {
        return NotFoundError('Player is not a member of any team');
    }

    const team = await TeamsModel.findByPk(teamPlayer.team_id);
    if (team.owner_id == playerId) {
        const anotherTeamMember = await TeamPlayersModel.findOne({
            where: { team_id: team.id, player_id: { [Op.ne]: playerId } }
        });

        if (anotherTeamMember) {
            team.owner_id = anotherTeamMember.player_id;
            await team.save();
        } else {
            await team.destroy();
        }
    }

    await TeamPlayersModel.destroy({ where: { player_id: playerId } });
    await CharactersModel.destroy({ where: { id: playerId } });

    return success({}, message = 'Player left team successfully');
}

const changeOwner = async (playerId) => {
    const player = await CharactersModel.findByPk(playerId);
    if (!player) {
        return NotFoundError('Player not found');
    }

    const teamPlayer = await TeamPlayersModel.findOne({ where: { player_id: playerId } });
    if (!teamPlayer) {
        return NotFoundError('Player is not a member of any team');
    }

    const team = await TeamsModel.findByPk(teamPlayer.team_id);
    if (team.owner_id == playerId) {
        return BadRequestError('Player is already the owner of the team');
    }

    team.owner_id = playerId;
    await team.save();

    return success({}, message = 'Owner changed successfully');
}

module.exports = {
    getAllTeams,
    getTeam,
    createTeam,
    deleteTeam,
    addCharacterToTeam,
    updateTeam,
    leaveTeam,
    changeOwner
};
