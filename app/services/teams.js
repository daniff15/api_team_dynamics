const { TeamsModel, TeamCharactersModel, CharactersModel } = require('../models/index');
const { includePlayerAssociationsInsideTeam, constructPlayerResponse } = require('../utils/characters');

const getAllTeams = async (communityId) => {
    const queryOptions = {
        where: {}
    };

    if (communityId) {
        queryOptions.where.community_id = communityId;
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
        throw new Error('Team not found');
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
            throw new Error('Team not found');
        }

        const teamInSameCommunity = await TeamsModel.findOne({
            where: { community_id: team.community_id },
            include: [{ model: TeamCharactersModel, where: { character_id: characterId } }]
        });
        if (teamInSameCommunity) {
            throw new Error('This character is already part of another team in the same community');
        }

        const currentMembersCount = await TeamCharactersModel.count({ where: { team_id: teamId } });
        if (currentMembersCount >= 4) {
            throw new Error('Team already has 4 members');
        }

        const existingMember = await TeamCharactersModel.findOne({ where: { team_id: teamId, character_id: characterId } });
        if (existingMember) {
            throw new Error('This character is already a member of the team');
        }

        const character = await CharactersModel.findByPk(characterId);
        if (!character) {
            throw new Error('Character not found');
        }
        
        const result = await TeamCharactersModel.create({ team_id: teamId, character_id: characterId });
        return result;
    } catch (error) {
        throw error;
    }
};

const updateTeam = async (teamId, updates) => {
    const team = await TeamsModel.findByPk(teamId);
    if (!team) {
        throw new Error('Team not found');
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
        throw new Error('No valid fields provided for update');
    }

    await TeamsModel.update(updatedFields, { where: { id: teamId } });

    const updatedTeam = await TeamsModel.findByPk(teamId);
    if (!updatedTeam) {
        throw new Error('Updated team not found');
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
