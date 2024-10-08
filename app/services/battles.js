const { Op } = require('sequelize');
const { BattlesModel, sequelize, TeamsModel, TeamPlayersModel, AttacksModel, CharactersModel, GameBossesModel, BossesModel, GamesModel } = require('../models/index');
const { checkBattleEnd, initializeQueue, calculateDamage, rewardWinningTeam, hasDefeatedBoss } = require('../utils/battles');
const { updateParticipantBattleStatus, includePlayerAssociationsInsideTeam, includeBossesAssociations } = require('../utils/characters');
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
            if (filters.battle_type === 'BOSS') {
                where.boss_id = { [Op.not]: null };
            } else if (filters.battle_type === 'TEAM') {
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
        let { team_id, opponent_team_id, boss_id } = battle;

        // If the body passed to create a battle has a 0 value for opponent_team_id or boss_id, we should set it to null in order to avoid unecessary errors.
        opponent_team_id = opponent_team_id == 0 ? null : opponent_team_id;
        boss_id = boss_id == 0 ? null : boss_id;

        if (opponent_team_id && boss_id) {
            return BadRequestError('You can only have one opponent');
        }

        if (!opponent_team_id && !boss_id) {
            return BadRequestError('You must have an opponent');
        }

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
        
        if (participants.team_players.length !== 4) {
            return BadRequestError('Team must have 4 characters');
        }
            
        let opponent;
        const now = new Date();
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

            if (opponent.team_players.length !== 4) {
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
                include: includeBossesAssociations()
            });

            if (!opponent) {
                return NotFoundError('Boss not found');
            }

            const game = await GamesModel.findByPk(participants.game_id);

            if (game.status === false) {
                return NotFoundError('Game is not active');
            }

            const gameBosses = await GameBossesModel.findOne({
                where: {
                    game_id: participants.game_id,
                    boss_id: boss_id
                }
            });

            if (!gameBosses) {
                return BadRequestError('Boss not in the game narrative');
            }

            opponent = {
                character_id: opponent.id,
                character_type: opponent.character_type_id,
                character: opponent
            };
        
            if (participants.cooldown_time && new Date(participants.cooldown_time) > now) {
                return BadRequestError('Team is on cooldown and cannot battle any bosses. Cooldown till: ' + participants.cooldown_time);
            }
        }

        const battle_date = new Date();

        const createdBattle = await BattlesModel.create({
            team_id,
            opponent_team_id,
            boss_id,
            battle_date
        }, { transaction });

        const battle_id = createdBattle.id;

        let deepCloneParticipants = [];
        //Transform the participants to the format required for battle
        for (let participant of [...participants.team_players, ...(opponent.team_players || [opponent])]) {
            const attributesArray = participant?.player ? participant.player.character.character_level_attributes : participant.character.character_level_attributes;
            const attributes = attributesArray.reduce((acc, attribute) => {
                acc[attribute.attribute.name] = attribute.value;
                return acc;
            }, {});
            const level = participant?.player ? participant.player.character.level_id : participant.character.level_id;
            
            attributes.hp_battle = Math.round(attributes.HP * (1 + (level - 1) * 0.12));

            // Transform strengths and weaknesses before element transofmation
            if (participant?.player) {
                participant.player.character.character_elements.forEach(element => {
                    participant.strengths = element.element.strengths.map(strength => strength.element.id);
                    participant.weaknesses = element.element.weaknesses.map(weakness => weakness.element.id);
                });
            } else {
                participant.character.character_elements.forEach(element => {
                    participant.strengths = element.element.strengths.map(strength => strength.element.id);
                    participant.weaknesses = element.element.weaknesses.map(weakness => weakness.element.id);
                });
            }
                
            participant = {
                id: participant?.player ? participant.player.id : participant.character.id,
                name: participant?.player ? participant.player.character.name : participant.character.name,
                team: participant.team_id,
                level: level,
                character_type: participant?.player ? participant.player.character.character_type_id : participant.character.character_type_id,
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

        let reward = null;
        if (boss_id) {
            if(battleResult.winnerId === boss_id) {
                const boss = await BossesModel.findOne({ where: { id: boss_id }, transaction });
                const cooldownEndTime = new Date(now.getTime() + (boss.cooldown_time * 1000));
                const formattedCooldownEndTime = cooldownEndTime.toISOString().slice(0, 19).replace('T', ' ');
                await TeamsModel.update({ cooldown_time: formattedCooldownEndTime}, { where: { id: team_id }, transaction });
                await transaction.commit();
            } else {
                const defeatedBoss = await hasDefeatedBoss(team_id, boss_id);

                if (!(defeatedBoss)) {
                    reward = await rewardWinningTeam(battleResult, boss_id, transaction);
                }
            }
        } else {
            if (battleResult && battleResult.winnerId) {
                await BattlesModel.update({ winner_id: battleResult.winnerId }, { where: { id: battle_id }, transaction });
            }
            await transaction.commit();
        }

        return success({
            battle: {
                id: battle_id,
                team_id,
                opponent_team_id,
                boss_id,
                battle_date,
                winner_id: battleResult.winnerId || null
            },
            participants: deepCloneParticipants,
            reward: reward
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
