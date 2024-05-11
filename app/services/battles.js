const pool = require('../config/connection');
const { fetchParticipants, checkBattleEnd, initializeQueue, calculateDamage } = require('../utils/battles');
const { updateParticipantBattleStatus } = require('../utils/characters');

async function getAllBattles(filters = {}) {
    let query = `SELECT * FROM battles WHERE 1=1`;
    const params = [];

    if (filters.team_id) {
        query += ` AND (team_id = ? OR opponent_team_id = ?)`;
        params.push(filters.team_id, filters.team_id);
    }

    if (filters.boss_id) {
        query += ` AND boss_id = ?`;
        params.push(filters.boss_id);
    }
    
    if (filters.winner_id) {
        query += ` AND winner_id = ?`;
        params.push(filters.winner_id);
    }
    
    if (filters.battle_type) {
        if (filters.battle_type === 'boss') {
            query += ` AND boss_id IS NOT NULL`;
        } else if (filters.battle_type === 'team') {
            query += ` AND opponent_team_id IS NOT NULL`;
        }
    }

    return await pool.query(query, params);
}

const getBattle = async (id) => {
    try {
        const [typeCheck] = await pool.query(`
            SELECT 
                boss_id,
                (boss_id IS NULL) AS is_team_battle
            FROM battles
            WHERE id = ?
        `, [id]);

        if (!typeCheck.length) {
            throw new Error('Battle not found');
        }

        let battleDetails;
        if (typeCheck[0].is_team_battle) {
            [battleDetails] = await pool.query(`
                SELECT 
                    b.id AS battle_id,
                    b.team_id,
                    b.opponent_team_id AS opponent_id,
                    b.battle_date,
                    b.winner_id,
                    t1.name AS team_name,
                    t2.name AS opponent_team_name
                FROM battles b
                JOIN teams t1 ON b.team_id = t1.id
                JOIN teams t2 ON b.opponent_team_id = t2.id
                WHERE b.id = ?
            `, [id]);
        } else {
            [battleDetails] = await pool.query(`
                SELECT 
                    b.id AS battle_id,
                    b.team_id,
                    b.boss_id AS opponent_id,
                    b.battle_date,
                    b.winner_id,
                    t.name AS team_name,
                    c.name AS boss_name
                FROM battles b
                JOIN teams t ON b.team_id = t.id
                JOIN characters c ON b.boss_id = c.id
                WHERE b.id = ?
            `, [id]);
        }

        const [attacks] = await pool.query(`
            SELECT 
                attacker_id,
                defender_id,
                damage,
                attack_time
            FROM attacks
            WHERE battle_id = ?
            ORDER BY attack_time ASC
        `, [id]);

        return {
            battle: battleDetails[0],
            attacks: attacks
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const createBattle = async (battle) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { team_id, opponent_team_id, boss_id } = battle;

        const now = new Date();
        const sqlNow = now.toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await connection.query(
            'INSERT INTO battles (team_id, boss_id, battle_date) VALUES (?, ?, ?)',
            [team_id, boss_id, sqlNow]
        );

        const battle_id = result.insertId;

        const participants = await fetchParticipants(connection, team_id, opponent_team_id, boss_id);
        
        // Deep clone the original array of participants, so this copy can change as the battle progresses
        const deepCloneParticipants = JSON.parse(JSON.stringify(participants));
        let battleQueue = initializeQueue(deepCloneParticipants);

        let battleResult;
        while (!(battleResult = checkBattleEnd(deepCloneParticipants)).battleEnded) {
            let current = battleQueue.shift();
            let damage = 0;
            let target = null;
            // VER O CASO DO BOSS DERROTAR UM ELE NAO PODE ATACAR VISTO Q JA FOI DERROTADO!!!
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
            if (damage !== 0) {
                await connection.query(
                    'INSERT INTO attacks(battle_id, attacker_id, defender_id, damage, attack_time) VALUES (?, ?, ?, ?, NOW())',
                    [battle_id, current.id, target.id, damage]
                )
            }

            // Update the target's HP and the current character's SPEED
            updateParticipantBattleStatus(deepCloneParticipants, target, 'hp_battle', damage);
            updateParticipantBattleStatus(deepCloneParticipants, current, 'SPEED');

            // After each phase of the battle, the queue is re-sorted based on the current SPEED of the participants
            if (battleQueue.length === 0) {
                battleQueue = initializeQueue(participants);
            }
        }

        // Finish the battle and update the row with the winner
        if (battleResult && battleResult.winnerId) {
            await connection.query(
                'UPDATE battles SET winner_id = ? WHERE id = ?',
                [battleResult.winnerId, battle_id]
            );
        }
        
        await connection.commit();
        return {
            battle: {
                id: result.insertId,
                team_id,
                opponent_team_id,
                boss_id,
                battle_date: sqlNow
            },
            participants: deepCloneParticipants 
        };
    } catch (error) {
        await connection.rollback();
        console.error('Failed to create battle:', error);
        throw error;
    } finally {
        connection.release();
    }
};


module.exports = {
    getAllBattles,
    getBattle,
    createBattle
};
