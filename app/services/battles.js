const { Op } = require('sequelize');
const { BattlesModel, sequelize, TeamsModel, TeamPlayersModel, AttacksModel, CharactersModel } = require('../models/index');
const { checkBattleEnd, initializeQueue, calculateDamage } = require('../utils/battles');
const { updateParticipantBattleStatus, includePlayerAssociationsInsideTeam, includeCharacterAssociationsOutsideTeam } = require('../utils/characters');
const { NotFoundError, ServerError, BadRequestError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');

const getAllBattles = async (filters = {}) => {
    try {
        let where = {};

        if (filters.team_id) {
            where[Op.or] = [
                { team_id: filters.team_id },
                { opponent_team_id: filters.team_id }
            ];
        }

        if (filters.boss_id) {
            where.boss_id = filters.boss_id;
        }

        if (filters.winner_id) {
            where.winner_id = filters.winner_id;
        }

        if (filters.battle_type) {
            if (filters.battle_type === 'boss') {
                where.boss_id = { [Op.not]: null };
            } else if (filters.battle_type === 'team') {
                where.opponent_team_id = { [Op.not]: null };
            }
        }

        const battles = await BattlesModel.findAll({ where: where });
        return success(battles);
    } catch (error) {
        return ServerError(error.message);
    }
};

const getBattle = async (id) => {
    try {
        const typeCheck = await BattlesModel.findOne({
            attributes: [
                'boss_id',
                [sequelize.literal('(boss_id IS NULL)'), 'is_team_battle']
            ],
            where: {
                id: id
            }
        });

        if (!typeCheck) {
            return NotFoundError('Battle not found');
        }

        let battleDetails;
        if (typeCheck.is_team_battle) {
            battleDetails = await BattlesModel.findOne({
                where: { id: id },
            });
        } else {
            battleDetails = await BattlesModel.findOne({
                where: { id: id },
            });
        }

        const attacks = await AttacksModel.findAll({
            where: { battle_id: id },
        });

        return success({
            battle: battleDetails,
            attacks: attacks
        });
    } catch (error) {
        return ServerError(error.message);
    }
};

const createBattle = async (battle) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const { team_id, opponent_team_id, boss_id } = battle;

        const participants = await TeamsModel.findOne({
            where: { id: team_id },
            include: [
                {
                    model: TeamPlayersModel,
                    include: includePlayerAssociationsInsideTeam()
                }
            ]
        });

        if (!participants) {
            return NotFoundError('Team not found');
        }

        if (participants.team_characters.length !== 4) {
            return BadRequestError('Team must have 4 characters');
        }

        let opponent;
        if(opponent_team_id !== null && boss_id !== null) {
            return BadRequestError('You can only have one opponent');
        }

        const battle_date = new Date();

        const createdBattle = await BattlesModel.create({
            team_id,
            opponent_team_id,
            boss_id,
            battle_date
        }, { transaction });

        const battle_id = createdBattle.id;

        if (opponent_team_id) {
            opponent = await TeamsModel.findOne({
                where: { id: opponent_team_id },
                include: [
                    {
                        model: TeamPlayersModel,
                        include: includePlayerAssociationsInsideTeam()
                    }
                ]
            });

            if (!opponent) {
                return NotFoundError('Opponent team not found');
            }

            if (opponent.team_characters.length !== 4) {
                return BadRequestError('Opponent team must have 4 characters');
            }
        } else {
            opponent = await CharactersModel.findOne({
                where: { 
                    id: boss_id, 
                    [Op.or]: [
                        { character_type_id: 2 },
                        { character_type_id: 3 }
                    ]
                },
                include: includeCharacterAssociationsOutsideTeam()
            });

            if (!opponent) {
                return NotFoundError('Boss not found');
            }

            opponent = {
                character_id: opponent.id,
                character_type: opponent.character_type_id,
                character: opponent
            };
        }

        let deepCloneParticipants = [];
        //Transform the participants to the format required for battle
        for (let participant of [...participants.team_characters, ...(opponent.team_characters || [opponent])]) {
            const attributesArray = participant.character.character_level_attributes;
            const attributes = attributesArray.reduce((acc, attribute) => {
                acc[attribute.attribute.name] = attribute.value;
                return acc;
            }, {});
            
            attributes.hp_battle = attributes.HP * (1 + (participant.character.level_id - 1) * 0.12);

            // Transform strengths and weaknesses before element transofmation
            participant.character.character_elements.forEach(element => {
                participant.strengths = element.element.strengths.map(strength => strength.element.id);
                participant.weaknesses = element.element.weaknesses.map(weakness => weakness.element.id);
            });

            participant = {
                id: participant.character.id,
                name: participant.character.name,
                team: participant.team_id,
                level: participant.character.level_id,
                character_type: participant.character.character_type_id,
                attributes: attributes,
                real_speed: attributes.SPEED,
            };

            deepCloneParticipants.push(participant);
        }

        let battleQueue = initializeQueue(deepCloneParticipants);

        let battleResult;
        while (!(battleResult = checkBattleEnd(deepCloneParticipants, opponent_team_id)).battleEnded) {
            let current = battleQueue.shift();
            let damage = 0;
            let target = null;
            if (!opponent_team_id) {
                if (current.character_type === 3 || current.character_type === 2) {
                    const availableTargets = deepCloneParticipants.filter(p => p.character_type === 1 && p.attributes.hp_battle > 0);
                    target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
                    damage = current.attributes.SPEED === 0 ? 0 : calculateDamage(current, target);
                }
                else {
                    const availableTargets = deepCloneParticipants.filter(p => p.character_type === 3 && p.attributes.hp_battle > 0);
                    target = availableTargets[0];
                    damage = current.attributes.SPEED === 0 ? 0 : calculateDamage(current, target);
                }
            }
            else {
                const availableTargets = deepCloneParticipants.filter(p => p.team !== current.team && p.attributes.hp_battle > 0);
                target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
                damage = current.attributes.SPEED === 0 ? 0 : calculateDamage(current, target);
            }
            if (damage !== 0) {
                await AttacksModel.create({
                    battle_id,
                    attacker_id: current.id,
                    defender_id: target.id,
                    damage,
                    attack_time: new Date()
                }, { transaction });
            }

            updateParticipantBattleStatus(deepCloneParticipants, target, 'hp_battle', damage);
            updateParticipantBattleStatus(deepCloneParticipants, current, 'SPEED');

            if (battleQueue.length === 0) {
                battleQueue = initializeQueue(deepCloneParticipants);
            }
        }

        if (battleResult && battleResult.winnerId) {
            await BattlesModel.update({ winner_id: battleResult.winnerId }, { where: { id: battle_id }, transaction });
        }

        await transaction.commit();

        return success({
            battle: {
                id: battle_id,
                team_id,
                opponent_team_id,
                boss_id,
                battle_date,
                winner_id: battleResult.winnerId || null
            },
            participants: deepCloneParticipants
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        return ServerError(error.message);
    }
};

module.exports = {
    getAllBattles,
    getBattle,
    createBattle
};
