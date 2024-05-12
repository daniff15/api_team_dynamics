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

const checkBattleEnd = (participants) => {
    const boss = participants.find(p => p.character_type === 3 || p.character_type === 2);
    const players = participants.filter(p => p.character_type === 1);

    if (boss && boss.attributes.hp_battle <= 0) {
        console.log("Boss has been defeated! Congratulations!");
        return { teamId: players[0].character_type, bossId: boss.id, winnerId: players[0].team, battleEnded: true };
    } else if (players.length > 0 && players.every(p => p.attributes.hp_battle <= 0)) {
        console.log("All players have been defeated! Game over!");
        return { teamId: players[0].character_type, bossId: boss.id, winnerId: boss.id, battleEnded: true };
    }
    return { battleEnded: false };
}


module.exports = {
    checkBattleEnd,
    initializeQueue,
    calculateDamage
};