const pool = require('../config/connection');

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
        console.log(typeCheck[0])

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

module.exports = {
    getAllBattles,
    getBattle
};
