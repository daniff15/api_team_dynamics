const { CommunitiesModel } = require('../models/index');
const { NotFoundError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');

const getAllCommunities = async () => {
    const communities = await CommunitiesModel.findAll({});
    return communities;
};

const getCommunity = async (id) => {
    const community = await CommunitiesModel.findByPk(id);

    if (!community) {
        return NotFoundError('Community not found');
    }

    return success(community);
}

const createCommunity = async (community) => {
    const newCommunity = await CommunitiesModel.create(community);
    return success(newCommunity);
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
