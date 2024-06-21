require('dotenv').config();
const { TeamPlayersModel, PlayersModel, LevelsModel, CharactersModel, BattlesModel } = require("../models");
const { updateTeamTotalXP, includePlayerAssociationsOutsideTeamPlayer, checkLevelUp, updateParticipantBattleStatus } = require("./characters");
const fs = require('fs');

// Global Variables
const CRITICAL_HIT_PROBABILITY = parseFloat(process.env.CRITICAL_HIT_PROBABILITY) ||0.1;
const STRONG_ATTACK = parseFloat(process.env.STRONG_ATTACK) || 1.5;
const WEAK_ATTACK = parseFloat(process.env.WEAK_ATTACK) || 0.5;

const initializeQueue = (participants) => {
    const allCharacters = participants;
    const characters = allCharacters.filter(character => character.attributes.hp_battle > 0);
    characters.sort((a, b) => {
        return b.attributes.SPEED - a.attributes.SPEED;
    });

    return characters;
}

const calculateDamage = (attacker, defender) => {
    let baseDamage = (attacker.attributes.ATK * attacker.attributes.ATK) / (attacker.attributes.ATK + defender.attributes.DEF);

    if (Math.random() < CRITICAL_HIT_PROBABILITY) {
        baseDamage *= STRONG_ATTACK;
    }

    // VER A OPCAO DE QUANDO O BOSS TEM DIFERENTES ELEMENTS
    // Por agora realiza a batalha na mesma, mas damageModifier = 1.0 pq nao entra em nenhuma condicao
    let damageModifier = 1.0;
    if (attacker.strength === defender.element) {
        damageModifier = STRONG_ATTACK;
    } else if (attacker.element === defender.strength) {
        damageModifier = WEAK_ATTACK;
    }

    const totalDamage = parseInt((baseDamage * damageModifier) * (Math.floor(Math.random() * (255 - 240 + 1)) + 240) / 255, 10);
    
    return totalDamage;
};

const checkBattleEnd = (participants, boss_fight) => {
    if (!boss_fight) {
        const boss = participants.find(p => p.character_type !== 1);
        const players = participants.filter(p => p.character_type === 1);

        if (boss.attributes.hp_battle <= 0) {
            return { teamId: players[0].character_type, bossId: boss.id, winnerId: players[0].team, battleEnded: true };
        } else if (players.length > 0 && players.every(p => p.attributes.hp_battle <= 0)) {
            return { teamId: players[0].character_type, bossId: boss.id, winnerId: boss.id, battleEnded: true };
        }
    } else {
        const teamIds = [...new Set(participants.map(p => p.team))];
        const team1 = participants.filter(p => p.team === teamIds[0]);
        const team2 = participants.filter(p => p.team === teamIds[1]);

        if (team1.length > 0 && team1.every(p => p.attributes.hp_battle <= 0)) {
            return { teamId: teamIds[0], opponent_team_id: teamIds[1], winnerId: teamIds[1], battleEnded: true };
        } else if (team2.length > 0 && team2.every(p => p.attributes.hp_battle <= 0)) {
            return { teamId: teamIds[0], opponent_team_id: teamIds[1], winnerId: teamIds[0], battleEnded: true };
        }
    }
    return { battleEnded: false };
}

const rewardWinningTeam = async (battleResult, boss_id, t) => {
    const winningTeam = await TeamPlayersModel.findAll({ where: { team_id: battleResult.winnerId }, transaction: t });
    const boss = await CharactersModel.findOne({ where: { id: boss_id }, transaction: t });
    const reward = 100 * (Math.ceil(boss.level_id / 3));
    const maxLevel = await LevelsModel.max('level_value', { transaction: t });
    for (let character of winningTeam) {
        const player = await PlayersModel.findByPk(character.player_id, {
            include: includePlayerAssociationsOutsideTeamPlayer(true),
            transaction: t
        });
        if (player.character.level_id !== maxLevel) {
            player.xp += reward;
            player.total_xp += reward;
            await player.save({ transaction: t });
            await checkLevelUp(player, maxLevel, t);
        } else {
            player.total_xp += reward;
            await player.save({ transaction: t });
        }
        
        await updateTeamTotalXP(player.id, t); 
    }

    t.commit();

    return reward;
};

const simulateBattle = async (team, opponent) => {
    let deepCloneParticipants = [];
    // Transform the participants to the format required for battle
    for (let participant of [...team.team_players, opponent]) {
        const attributesArray = participant?.player ? participant.player.character.character_level_attributes : participant.character.character_level_attributes;
        const attributes = attributesArray.reduce((acc, attribute) => {
            acc[attribute.attribute.name] = attribute.value;
            return acc;
        }, {});
        const level = participant?.player ? participant.player.character.level_id : participant.character.level_id;
        
        attributes.hp_battle = Math.round(attributes.HP * (1 + (level - 1) * 0.12));

        // Transform strengths and weaknesses before element transformation
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
    while (!(battleResult = checkBattleEnd(deepCloneParticipants, false)).battleEnded) {
        let current = battleQueue.shift();
        let damage = 0;
        let target = null;
        const availableTargets = deepCloneParticipants.filter(p => p.team !== current.team && p.attributes.hp_battle > 0);
        target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        damage = current.attributes.SPEED === 0 ? 0 : calculateDamage(current, target);

        updateParticipantBattleStatus(deepCloneParticipants, target, 'hp_battle', damage);
        updateParticipantBattleStatus(deepCloneParticipants, current, 'SPEED');

        if (battleQueue.length === 0) {
            battleQueue = initializeQueue(deepCloneParticipants);
        }
    }

    return battleResult;
};

const simulateBattles = async (team, opponent) => {
    let winCount = 0;
    for (let i = 0; i < 100; i++) {
        const battleResult = await simulateBattle(team, opponent); 
        if (battleResult.winnerId === team.id) {
            winCount++;
        }
    }
    return winCount / 100;
};

const hasDefeatedBoss = async (teamId, bossId) => {
    const previousVictory = await BattlesModel.findOne({
        where: {
            team_id: teamId,
            boss_id: bossId,
            winner_id: teamId
        }
    });

    return previousVictory !== null;
};

module.exports = {
    checkBattleEnd,
    initializeQueue,
    calculateDamage,
    rewardWinningTeam,
    simulateBattles,
    hasDefeatedBoss,
};