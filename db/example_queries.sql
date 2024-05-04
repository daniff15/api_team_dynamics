
-- Queries
-- Get team stats
SELECT
    t.name AS TeamName,
    c.name AS CharacterName,
    MAX(CASE WHEN a.name = 'HP' THEN cla.value ELSE 0 END) AS HP,
    MAX(CASE WHEN a.name = 'ATK' THEN cla.value ELSE 0 END) AS ATK,
    MAX(CASE WHEN a.name = 'DEF' THEN cla.value ELSE 0 END) AS DEF,
    MAX(CASE WHEN a.name = 'SPEED' THEN cla.value ELSE 0 END) AS SPEED,
    MAX(CASE WHEN a.name = 'XP' THEN cla.value ELSE 0 END) AS XP,
    GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS Elements
FROM teams t JOIN team_characters tc ON t.id = tc.team_id JOIN characters c ON tc.character_id = c.id
JOIN character_level_attributes cla ON c.id = cla.character_id JOIN attributes a ON cla.attribute_id = a.id
LEFT JOIN character_elements ce ON c.id = ce.character_id LEFT JOIN elements e ON ce.element_id = e.id
WHERE t.id = 2
GROUP BY t.name, c.name ORDER BY c.name;

-- Get all the bosses
SELECT
    c.id AS CharacterID,
    c.name AS CharacterName,
    ct.name AS Type,
    c.level AS Level
FROM characters c JOIN character_types ct ON c.character_type = ct.id WHERE ct.name = 'Boss';

-- Query to fetch the Water type boss and his attribute values
SELECT
    c.name AS BossName,
    ct.name AS Type,
    c.level AS Level,
    MAX(CASE WHEN a.name = 'HP' THEN cla.value ELSE NULL END) AS HP,
    MAX(CASE WHEN a.name = 'ATK' THEN cla.value ELSE NULL END) AS ATK,
    MAX(CASE WHEN a.name = 'DEF' THEN cla.value ELSE NULL END) AS DEF,
    MAX(CASE WHEN a.name = 'SPEED' THEN cla.value ELSE NULL END) AS SPEED,
    MAX(CASE WHEN a.name = 'XP' THEN cla.value ELSE NULL END) AS XP,
    e.name AS Element
FROM characters c
JOIN character_types ct ON c.character_type = ct.id
JOIN character_level_attributes cla ON cla.character_id = c.id
JOIN attributes a ON cla.attribute_id = a.id
JOIN character_elements ce ON ce.character_id = c.id
JOIN elements e ON ce.element_id = e.id
WHERE ct.name = 'Boss' AND e.name = 'Water'
GROUP BY c.name, ct.name, c.level, e.name;