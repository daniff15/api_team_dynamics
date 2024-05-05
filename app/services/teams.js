const pool = require('../config/connection');

const getAllTeams = async () => {
    const [rows] = await pool.query('SELECT * FROM teams');
    return rows;
};

const getTeam = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            t.id AS team_id,
            t.name AS team_name,
            c.id AS character_id,
            c.name AS character_name,
            c.level AS level,
            MAX(CASE WHEN a.name = 'HP' THEN cla.value ELSE 0 END) AS HP,
            MAX(CASE WHEN a.name = 'ATK' THEN cla.value ELSE 0 END) AS ATK,
            MAX(CASE WHEN a.name = 'DEF' THEN cla.value ELSE 0 END) AS DEF,
            MAX(CASE WHEN a.name = 'SPEED' THEN cla.value ELSE 0 END) AS SPEED,
            MAX(CASE WHEN a.name = 'XP' THEN cla.value ELSE 0 END) AS XP,
            ce.elements
        FROM teams t
        LEFT JOIN team_characters tc ON t.id = tc.team_id
        LEFT JOIN characters c ON tc.character_id = c.id
        LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
        LEFT JOIN attributes a ON cla.attribute_id = a.id
        LEFT JOIN (
            SELECT character_id, GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
            FROM character_elements
            JOIN elements e ON character_elements.element_id = e.id
            GROUP BY character_id
        ) ce ON c.id = ce.character_id
        WHERE t.id = ?
        GROUP BY c.id
        ORDER BY c.name;
    `, [id]);

    if (!rows.length) {
        throw new Error('Team not found'); 
    }

    const teamData = {
        id: rows[0].team_id,
        name: rows[0].team_name,
        members: []
    };

    rows.forEach(row => {
        if (row.character_id) { 
            if (!teamData.members.some(member => member.id === row.character_id)) {
                teamData.members.push({
                    id: row.character_id,
                    name: row.character_name,
                    level: row.level,
                    HP: row.HP,
                    ATK: row.ATK,
                    DEF: row.DEF,
                    SPEED: row.SPEED,
                    XP: row.XP,
                    elements: row.elements
                });
            }
        }
    });

    return teamData;
}

const createTeam = async (team) => {
    const [result] = await pool.query('INSERT INTO teams SET ?', team);
    return result;
}

const deleteTeam = async (id) => {
    const [result] = await pool.query('DELETE FROM teams WHERE id = ?', id);
    return result;
}

const addCharacterToTeam = async (teamId, characterId) => {
    const [currentMembers] = await pool.query('SELECT COUNT(*) AS count FROM team_characters WHERE team_id = ?', [teamId]);
    
    if (currentMembers[0].count >= 4) {
        throw new Error('Team already has 4 members');
    }

    const [existingMember] = await pool.query('SELECT COUNT(*) AS count FROM team_characters WHERE team_id = ? AND character_id = ?', [teamId, characterId]);
    if (existingMember[0].count > 0) {
        throw new Error('This character is already a member of the team');
    }

    const [result] = await pool.query('INSERT INTO team_characters (team_id, character_id) VALUES (?, ?)', [teamId, characterId]);
    return result;
};

const updateTeam = async (teamId, updates) => {
    // Prevent from changing key values like id or community_id
    const allowedUpdates = {
        name: updates.name
    };

    const fieldsToUpdate = [];
    const values = [];
    Object.entries(allowedUpdates).forEach(([key, value]) => {
        if (value !== undefined) {  
            fieldsToUpdate.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (!fieldsToUpdate.length) {
        throw new Error('No valid fields provided for update');
    }

    const sql = `UPDATE teams SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    values.push(teamId); 
    
    const [result] = await pool.query(sql, values);
    return result;
};



module.exports = {
    getAllTeams,
    getTeam,
    createTeam,
    deleteTeam,
    addCharacterToTeam,
    updateTeam
};
