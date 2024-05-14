const { TeamsModel, TeamCharactersModel, CharactersModel, CommunitiesModel } = require('../models/index');
const { includePlayerAssociationsInsideTeam, constructPlayerResponse } = require('../utils/characters');
const { BadRequestError, NotFoundError, ServerError, ConflictError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');

const getAllTeams = async (community_id, orderByTotalXP = 'DESC') => {

    const queryOptions = {
        where: {},
        order: [['total_xp', orderByTotalXP]] 
    };

    if (community_id) {
        const community = await CommunitiesModel.findOne({ where: { id: community_id } });
        if (!community) {
            return NotFoundError('Community not found');
        }
        queryOptions.where.community_id = community_id;
    }

    const teams = await TeamsModel.findAll(queryOptions);
    return success(teams);
};

const getTeam = async (id) => {
    const teamsData = await TeamsModel.findOne({
        where: { id: id },
        include: [
            {
                model: TeamCharactersModel,
                include: includePlayerAssociationsInsideTeam()
            }
        ]
    });

    if (!teamsData) {
        return NotFoundError('Team not found');
    }

    const teamData = {
        id: teamsData.id,
        community_id: teamsData.community_id,
        name: teamsData.name,
        total_xp: teamsData.total_xp,
        members: []
    };

    teamsData.team_characters.forEach(teamCharacter => {
        const character = teamCharacter.character;
        teamData.members.push(constructPlayerResponse(character));
    });

    return success(teamData);
};


const createTeam = async (team) => {
    const community = await CommunitiesModel.findByPk(team.community_id);
    if (!community) {
        return NotFoundError('Community not found');
    }

    const existingTeam = await TeamsModel.findOne({
        where: {
            name: team.name,
            community_id: team.community_id
        }
    });

    if (existingTeam) {
        return ConflictError('A Team with the same name already exists in the community');
    }
    
    const newTeam = await TeamsModel.create(team);
    return success(newTeam);
}

const deleteTeam = async (id) => {
    const result = await TeamsModel.destroy({
        where: {
            id
        }
    });
    return result;
}

const addCharacterToTeam = async (teamId, characterId) => {
    try {
        const team = await TeamsModel.findByPk(teamId);
        if (!team) {
            return NotFoundError('Team not found');
        }

        const teamInSameCommunity = await TeamsModel.findOne({
            where: { community_id: team.community_id },
            include: [{ model: TeamCharactersModel, where: { character_id: characterId } }]
        });
        if (teamInSameCommunity) {
            return ConflictError('Character is already a member of a team in the same community');
        }

        const currentMembersCount = await TeamCharactersModel.count({ where: { team_id: teamId } });
        if (currentMembersCount >= 4) {
            return BadRequestError('Team is already full (4 members max)');
        }

        const existingMember = await TeamCharactersModel.findOne({ where: { team_id: teamId, character_id: characterId } });
        if (existingMember) {
            return ConflictError('Character is already a member of the team');
        }
        console.log('teamId', teamId);
        console.log(characterId);

        const character = await CharactersModel.findByPk(characterId);
        if (!character) {
            return NotFoundError('Character not found');
        }

        
        const result = await TeamCharactersModel.create({ team_id: teamId, character_id: characterId });
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

module.exports = {
    getAllTeams,
    getTeam,
    createTeam,
    deleteTeam,
    addCharacterToTeam,
    updateTeam
};
