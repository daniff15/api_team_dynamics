const { CommunitiesModel } = require('../models/index');

const getAllCommunities = async () => {
    const communities = await CommunitiesModel.findAll({});
    return communities;
};

const getCommunity = async (id) => {
    const community = await CommunitiesModel.findByPk(id);

    if (!community) {
        throw new Error('Community not found');
    }

    return community;
}

const createCommunity = async (community) => {
    const newCommunity = await CommunitiesModel.create(community);
    return newCommunity;
}

const deleteCommunity = async (id) => {
    const result = await CommunitiesModel.destroy({
        where: {
            id
        }
    });
    return result;
}

module.exports = {
    getAllCommunities,
    getCommunity,
    createCommunity,
    deleteCommunity
};
