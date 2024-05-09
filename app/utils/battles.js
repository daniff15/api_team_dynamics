const fetchAttributes = async (connection, teamId, isBoss = false) => {
    const idField = isBoss ? "c.id" : "tc.team_id";
    return await connection.query(`
        SELECT 
            c.id,
            c.name,
            ${isBoss ? '' : 'tc.team_id,'}
            c.character_type,
            c.level,
            GROUP_CONCAT(DISTINCT e.name ORDER BY e.name) AS elements,
            GROUP_CONCAT(DISTINCT es.name ORDER BY es.name) AS strengths,
            GROUP_CONCAT(a.name ORDER BY a.name) AS attribute_names,
            GROUP_CONCAT(cla.value ORDER BY a.name) AS attribute_values
        FROM characters c
        JOIN character_level_attributes cla ON c.id = cla.character_id
        JOIN attributes a ON cla.attribute_id = a.id
        ${isBoss ? '' : 'JOIN team_characters tc ON c.id = tc.character_id'}
        JOIN character_elements ce ON c.id = ce.character_id
        JOIN elements e ON ce.element_id = e.id
        LEFT JOIN element_strengths ess ON e.id = ess.element_id
        LEFT JOIN elements es ON ess.strong_against_id = es.id
        WHERE ${idField} = ?
        GROUP BY c.id ${isBoss ? ';' : ', tc.team_id;'}

    `, [teamId]);
};

const fetchParticipants = async (connection, team_id, opponent_team_id, boss_id) => {
    const [teamMembers] = await fetchAttributes(connection, team_id);

    let bossAttributes = [];
    // If boss_id, then it's a boss fight
    if (boss_id) {
        const [boss] = await fetchAttributes(connection, boss_id, true);
        bossAttributes = boss;
    }

    let opponentAttributes = [];
    // If opponent_team_id, then it's a team fight
    if (opponent_team_id) {
        const [opponentTeam] = await fetchAttributes(connection, opponent_team_id);
        opponentAttributes = opponentTeam;
    }

    let participants = teamMembers.concat(bossAttributes, opponentAttributes);

    participants = participants.map(participant => {
        const attributesArray = participant.attribute_names.split(',');
        const valuesArray = participant.attribute_values.split(',');
        const attributes = attributesArray.reduce((attrs, name, index) => {
            attrs[name] = parseInt(valuesArray[index], 10);
            return attrs;
        }, {});
        attributes.hp_battle = attributes.HP * (1 + (participant.level - 1) * 0.12); // Formula to calculate hp_battle

        return {
            id: participant.id,
            name: participant.name,
            team: participant.team_id,
            level: participant.level,
            character_type: participant.character_type, 
            attributes: attributes,
            element: participant.elements,
            strength: participant.strengths,
        };
    });

    participants.sort((a, b) => {
        return b.attributes.SPEED - a.attributes.SPEED;
    });

    return participants;
}

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
    if (boss.attributes.hp_battle <= 0) {
        console.log("Boss has been defeated! Congratulations!");
        return true;
    } else if (players.every(p => p.attributes.hp_battle <= 0)) {
        console.log("All players have been defeated! Game over!");
        return true;
    }
    return false;

}

module.exports = {
    fetchParticipants,
    checkBattleEnd,
    initializeQueue,
    calculateDamage
};