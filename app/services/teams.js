const { TeamsModel, TeamCharactersModel, CharactersModel, CommunitiesModel } = require('../models/index');
const { includePlayerAssociationsInsideTeam, constructPlayerResponse } = require('../utils/characters');
const { BadRequestError, NotFoundError, ServerError } = require('../utils/errors');

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
    return teams;
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

    return teamData;
};


const createTeam = async (team) => {
    const newTeam = await TeamsModel.create(team);
    return newTeam;
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
            return BadRequestError('Character is already a member of a team in the same community');
        }

        const currentMembersCount = await TeamCharactersModel.count({ where: { team_id: teamId } });
        if (currentMembersCount >= 4) {
            return BadRequestError('Team is already full (4 members max)');
        }

        const existingMember = await TeamCharactersModel.findOne({ where: { team_id: teamId, character_id: characterId } });
        if (existingMember) {
            return BadRequestError('Character is already a member of the team');
        }

        const character = await CharactersModel.findByPk(characterId);
        if (!character) {
            return NotFoundError('Character not found');
        }
        
        const result = await TeamCharactersModel.create({ team_id: teamId, character_id: characterId });
        return result;
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

    return updatedTeam;
};




module.exports = {
    getAllTeams,
    getTeam,
    createTeam,
    deleteTeam,
    addCharacterToTeam,
    updateTeam
};
