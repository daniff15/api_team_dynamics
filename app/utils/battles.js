const { TeamPlayersModel, PlayersModel, LevelsModel, CharactersModel } = require("../models");
const { updateTeamTotalXP, includePlayerAssociationsOutsideTeamPlayer, checkLevelUp } = require("./characters");

const initializeQueue = (participants) => {
    const allCharacters = participants;
    const characters = allCharacters.filter(character => character.attributes.hp_battle > 0);
    characters.sort((a, b) => {
        return b.attributes.SPEED - a.attributes.SPEED;
    });

    return characters;
}

const CRITICAL_HIT_PROBABILITY = 0.1;
const calculateDamage = (attacker, defender) => {
    let baseDamage = (attacker.attributes.ATK * attacker.attributes.ATK) / (attacker.attributes.ATK + defender.attributes.DEF);

    if (Math.random() < CRITICAL_HIT_PROBABILITY) {
        baseDamage *= 1.5;
    }

    // VER A OPCAO DE QUANDO O BOSS TEM DIFERENTES ELEMENTS
    // Por agora realiza a batalha na mesma, mas damageModifier = 1.0 pq nao entra em nenhuma condicao
    let damageModifier = 1.0;
    if (attacker.strength === defender.element) {
        damageModifier = 1.5;
    } else if (attacker.element === defender.strength) {
        damageModifier = 0.5;
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
    const maxLevel = await LevelsModel.max('level_value', { transaction: t });
    for (let character of winningTeam) {
        const player = await PlayersModel.findByPk(character.player_id, {
            include: includePlayerAssociationsOutsideTeamPlayer(),
            transaction: t
        });
        if (player.character.level_id !== maxLevel) {
            player.xp += (100 * (boss.level_id / 5));
            player.total_xp += (100 * (boss.level_id / 5));
            await player.save({ transaction: t });
            await checkLevelUp(player, maxLevel, t);
        } else {
            player.total_xp += (100 * (boss.level_id / 5));
            await player.save({ transaction: t });
        }
        
        await updateTeamTotalXP(player.id, t); 
    }

    t.commit();
};

module.exports = {
    checkBattleEnd,
    initializeQueue,
    calculateDamage,
    rewardWinningTeam
};