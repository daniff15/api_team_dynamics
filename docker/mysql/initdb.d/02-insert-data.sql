USE team_dynamics;

SET FOREIGN_KEY_CHECKS = 0; -- Disable foreign key checks in MySQL

TRUNCATE TABLE character_elements;
TRUNCATE TABLE element_relationships;
TRUNCATE TABLE team_players;
TRUNCATE TABLE characters;
TRUNCATE TABLE players;
TRUNCATE TABLE bosses;
TRUNCATE TABLE teams;
TRUNCATE TABLE character_level_attributes;
TRUNCATE TABLE attributes;
TRUNCATE TABLE character_types;
TRUNCATE TABLE levels;
TRUNCATE TABLE elements;
TRUNCATE TABLE games;
TRUNCATE TABLE attacks;
TRUNCATE TABLE battles;
TRUNCATE TABLE games_bosses;

SET FOREIGN_KEY_CHECKS = 1; -- Re-enable foreign key checks

-- Inserting data into the 'games' table
INSERT INTO games (name) VALUES 
('Narrativa One'), 
('Narrativa Two');

-- Inserting data into the 'character_types' table
INSERT INTO character_types (name) VALUES 
('Player'), 
('Mini-Boss'), 
('Boss');

-- Inserting data into the 'levels' table
INSERT INTO levels (level_value) VALUES 
(1), 
(2), 
(3), 
(4), 
(5),
(6),
(7),
(8),
(9),
(10),
(11),
(12),
(13),
(14),
(15),
(16),
(17),
(18),
(19),
(20);

-- Inserting data into the 'characters' table
-- Se calhar XP e ATT deviam estar no character, pq a table char_level_attbr é por niveis.	
INSERT INTO characters (name, character_type_id, level_id) VALUES 
('Jogador Viseu', 1, 1),
('Jogador Setubal', 1, 1),
('Jogador Lisboa', 1, 1),
('Jogador Porto', 1, 1),
('Jogador Vitoria', 1, 1),
('Jogador Contomil', 1, 1),
('Jogador Aveiro', 1, 1),
('Jogador Vila Real', 1, 1),
('Boss Ar', 3, 5),
('Boss Terra', 3, 10),
('Boss Água', 3, 15),
('Boss Fogo', 3, 20);

INSERT INTO players(id, ext_id) VALUES
(1,'jogador_viseu'),
(2,'jogador_setubal'),
(3,'jogador_lisboa'),
(4,'jogador_porto'),
(5,'jogador_vitoria'),
(6,'jogador_contomil'),
(7,'jogador_aveiro'),
(8,'jogador_vila_real');

INSERT INTO bosses(id, before_defeat_phrase, after_defeat_phrase, cooldown_time) VALUES
(9, 'ainda nao morri 1', 'ja morri 1', 1800),
(10, 'ainda nao morri 2', 'ja morri 2', 3600),
(11, 'ainda nao morri 3', 'ja morri 3', 7200),
(12, 'ainda nao morri 4', 'ja morri 4', 14400);

INSERT INTO games_bosses(game_id, boss_id) VALUES 
(1,9),
(1,10),
(1,11),
(1,12),
(2,10),
(2,12);

-- Inserting data into the 'teams' table
INSERT INTO teams (name, community_id_ext, game_id, owner_id) VALUES 
('Alpha Team', 'deca', 1, 1), 
('Beta Team', 'cocaad', 2, 5);

-- Inserting data into the 'team_characters' table
INSERT INTO team_players (team_id, player_id) VALUES 
(1, 1), 
(1, 2), 
(1, 3), 
-- (1, 4), REMOVE ONE ELEMENT FROM THE FIRST TEAM TO TEST FUNCIONALITIES
(2, 5), 
(2, 6), 
(2, 7),
(2, 8);

-- Inserting data into the 'attributes' table
INSERT INTO attributes (name) VALUES 
('HP'), 
('DEF'), 
('ATK'), 
('SPEED'); 

-- Insert attribute values for character 1 at level 1
INSERT INTO character_level_attributes (character_id, level_id, attribute_id, value) VALUES
-- Water TYPE
(1, 1, 1, 10),  -- HP
(1, 1, 2, 8),   -- DEF
(1, 1, 3, 9),   -- ATK
(1, 1, 4, 7),   -- SPEED
-- Fire TYPE
(2, 1, 1, 9),  -- HP
(2, 1, 2, 7),   -- DEF
(2, 1, 3, 10),   -- ATK
(2, 1, 4, 8),   -- SPEED
-- Earth TYPE
(3, 1, 1, 8),  -- HP
(3, 1, 2, 10),   -- DEF
(3, 1, 3, 7),   -- ATK
(3, 1, 4, 9),   -- SPEED
-- Air TYPE
(4, 1, 1, 7),  -- HP
(4, 1, 2, 9),   -- DEF
(4, 1, 3, 8),   -- ATK
(4, 1, 4, 10),   -- SPEED
-- Water TYPE
(5, 1, 1, 10),  -- HP
(5, 1, 2, 8),   -- DEF
(5, 1, 3, 9),   -- ATK
(5, 1, 4, 7),   -- SPEED
-- Fire TYPE
(6, 1, 1, 9),  -- HP
(6, 1, 2, 7),   -- DEF
(6, 1, 3, 10),   -- ATK
(6, 1, 4, 8),   -- SPEED
-- Earth TYPE
(7, 1, 1, 8),  -- HP
(7, 1, 2, 10),   -- DEF
(7, 1, 3, 7),   -- ATK
(7, 1, 4, 9),   -- SPEED
-- Air TYPE
(8, 1, 1, 7),  -- HP
(8, 1, 2, 9),   -- DEF
(8, 1, 3, 8),   -- ATK
(8, 1, 4, 10),   -- SPEED
-- Boss Ar
(9, 5, 1, 65), -- HP
(9, 5, 2, 20), -- DEF
(9, 5, 3, 20), -- ATK
(9, 5, 4, 20), -- SPEED
-- Boss Terra 
(10, 5, 1, 200), -- HP
(10, 5, 2, 40), -- DEF
(10, 5, 3, 40), -- ATK
(10, 5, 4, 40), -- SPEED
-- Boss Água
(11, 5, 1, 400), -- HP
(11, 5, 2, 60), -- DEF
(11, 5, 3, 60), -- ATK
(11, 5, 4, 60), -- SPEED
-- Boss Fogo
(12, 5, 1, 600), -- HP
(12, 5, 2, 135), -- DEF
(12, 5, 3, 135), -- ATK
(12, 5, 4, 135); -- SPEED

-- Inserting data into the 'elements' table
INSERT INTO elements (name) VALUES 
('Water'), 
('Fire'), 
('Earth'), 
('Air');

-- Inserting data into the 'element_strengths' table
-- Example: Water is strong against Fire, etc.
INSERT INTO element_relationships (element_id, strong_against_id, weak_against_id) VALUES 
(1, 2, 3), -- Water strong against Fire
(2, 4, 1), -- Fire strong against Air
(4, 3, 2), -- Air strong against Earth
(3, 1, 4); -- Earth strong against Water

-- Inserting data into the 'character_elements' table
INSERT INTO character_elements (character_id, element_id) VALUES 
(1, 1), 
(2, 2),
(3, 3),
(4, 4),
(5, 1),
(6, 2),
(7, 3),
(8, 4),
(9, 4),
(10, 3),
(11, 1),
(12, 2);

-- Inserting data into the 'battles' table - team battle
INSERT INTO battles (team_id, opponent_team_id, battle_date, winner_id) VALUES (1, 2, NOW(), 1);
INSERT INTO battles (team_id, opponent_team_id, battle_date, winner_id) VALUES (1, 2, NOW(), 2);

-- Inserting data into the 'battles' table - boss battle
INSERT INTO battles (team_id, boss_id, battle_date, winner_id) VALUES (1, 9, NOW(), 1);
INSERT INTO battles (team_id, boss_id, battle_date, winner_id) VALUES (2, 10, NOW(), 10);

-- Inserting data into the 'attacks' table - simulate the attacks between characters and bosses
INSERT INTO attacks (battle_id, attacker_id, defender_id, damage, attack_time) VALUES 
(1, 1, 9, 5, NOW()), 
(1, 2, 9, 3, NOW()), 
(1, 3, 9, 4, NOW()), 
(1, 4, 9, 2, NOW()), 
(1, 9, 1, 10, NOW()), 
(1, 9, 2, 10, NOW()), 
(1, 9, 3, 10, NOW()), 
(1, 9, 4, 10, NOW()); 