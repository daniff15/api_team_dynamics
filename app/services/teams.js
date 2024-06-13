const { TeamsModel, TeamPlayersModel, CharactersModel, GamesModel } = require('../models/index');
const { includePlayerAssociationsInsideTeam, constructCharacterResponse } = require('../utils/characters');
const { BadRequestError, NotFoundError, ServerError, ConflictError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const { Op } = require('sequelize');

const getAllTeams = async (game_id, order_by_total_xp = 'DESC', search_comm_term = '') => {
    const queryOptions = {
        where: {},
        order: [['total_xp', order_by_total_xp]],
        include: [
            {
                model: TeamPlayersModel,
                include: includePlayerAssociationsInsideTeam()
            }
        ]
    };

    if (game_id) {
        const game = await GamesModel.findOne({ where: { id: game_id } });
        if (!game) {
            return NotFoundError('Game Narrative not found');
        }
        queryOptions.where.game_id = game_id;
    }

    if (search_comm_term) {
        queryOptions.where.community_id_ext = { [Op.like]: `%${search_comm_term}%` };
    }

    const teamsData = await TeamsModel.findAll(queryOptions);

    // Remove team_players from the response
    const response = teamsData.map(team => {
        const teamData = {
            id: team.id,
            community_id_ext: team.community_id_ext,
            game_id: team.game_id,
            owner_id: team.owner_id,
            name: team.name,
            total_xp: team.total_xp,
            team_image_path: team.team_image_path,
            cooldown_time: team.cooldown_time
        };

        return teamData;
    });

    return success(response);
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
        return ConflictError('Player is already a member of a team. Create a new player to create a new team.');
    }

    const newTeam = await TeamsModel.create(team);
    await TeamPlayersModel.create({ team_id: newTeam.id, player_id: owner });

    return success(newTeam, status_code = 201, message = 'Team created successfully');
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

    await TeamsModel.destroy({
        where: {
            id
        }
    });
    return success({id: parseInt(id)}, message = 'Team deleted successfully');
}

const addCharactersToTeam = async (teamId, characterIds) => {
    try {
        const team = await TeamsModel.findByPk(teamId);
        if (!team) {
            return NotFoundError('Team not found');
        }

        const existingMembers = await TeamPlayersModel.findAll({ where: { team_id: teamId } });
        if (existingMembers.length + characterIds.length > 4) {
            return BadRequestError(`Team has ${existingMembers.length} members, cannot add ${characterIds.length} more members since the maximum size of a team is 4`);
        }

        for (const characterId of characterIds) {
            const teamInSameGame = await TeamsModel.findOne({
                where: { game_id: team.game_id },
                include: [{ model: TeamPlayersModel, where: { player_id: characterId } }]
            });
            if (teamInSameGame) {
                return ConflictError(`Character with ID ${characterId} is already a member of a team in the same game narrative`);
            }

            const existingMember = existingMembers.find(member => member.player_id === characterId);
            if (existingMember) {
                return ConflictError(`Character with ID ${characterId} is already a member of the team.`);
            }

            const character = await CharactersModel.findByPk(characterId);
            if (!character) {
                return NotFoundError(`Character with ID ${characterId} not found.`);
            }
        }

        const results = [];
        for (const characterId of characterIds) {
            const result = await TeamPlayersModel.create({ team_id: teamId, player_id: characterId });
            results.push({
                team_id: parseInt(result.team_id),
                player_id: parseInt(result.player_id)
            });
        }

        return success(results, message = 'Players added to team sucessfully');
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
        name: updates.name,
        team_image_path: updates.team_image_path
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
    return success(updatedTeam, message = 'Team updated successfully');
};

const leaveTeam = async (playerId) => {
    const player = await CharactersModel.findByPk(playerId);
    if (!player) {
        return NotFoundError('Player not found');
    }

    const teamPlayer = await TeamPlayersModel.findOne({ where: { player_id: playerId } });
    if (!teamPlayer) {
        return BadRequestError('Player is not a member of any team');
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
        return BadRequestError('Player is not a member of any team');
    }

    const team = await TeamsModel.findByPk(teamPlayer.team_id);
    if (team.owner_id == playerId) {
        return BadRequestError('Player is already the owner of the team');
    }

    team.owner_id = parseInt(playerId);
    await team.save();

    return success(team, message = 'Owner changed successfully');
}

module.exports = {
    getAllTeams,
    getTeam,
    createTeam,
    deleteTeam,
    addCharactersToTeam,
    updateTeam,
    leaveTeam,
    changeOwner
};
