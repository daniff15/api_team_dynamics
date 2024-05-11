DROP DATABASE IF EXISTS team_dynamics;
CREATE DATABASE team_dynamics;
USE team_dynamics;

CREATE TABLE `communities` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `teams` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `community_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_teams_communities` FOREIGN KEY (`community_id`) 
        REFERENCES `communities` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `levels` (
    `level_value` int NOT NULL ,
    PRIMARY KEY (
        `level_value`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `character_types` (
    `id` int AUTO_INCREMENT NOT NULL ,
    `name` VARCHAR(256)  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `characters` (
    `id` int AUTO_INCREMENT NOT NULL ,
    `name` VARCHAR(256)  NOT NULL ,
    `character_type_id` INT NOT NULL,
    `level_id` INT NOT NULL,
    `xp` INT,
    `att_xtra_points` INT,
    PRIMARY KEY (
        `id`
    ),
    CONSTRAINT `fk_characters_character_types` FOREIGN KEY (`character_type_id`)
        REFERENCES `character_types` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_characters_levels` FOREIGN KEY (`level_id`)
        REFERENCES `levels` (`level_value`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `team_characters` (
    `team_id` INT NOT NULL,
    `character_id` INT NOT NULL,
    PRIMARY KEY (`team_id`, `character_id`),
    CONSTRAINT `fk_team_characters_teams` FOREIGN KEY (`team_id`)
        REFERENCES `teams` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_team_characters_characters` FOREIGN KEY (`character_id`)
        REFERENCES `characters` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `attributes` (
    `id` int AUTO_INCREMENT NOT NULL ,
    `name` VARCHAR(256)  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `character_level_attributes` (
    `character_id` INT NOT NULL,
    `level_id` INT NOT NULL,
    `attribute_id` INT NOT NULL,
    `value` INT NOT NULL,
    PRIMARY KEY (`character_id`, `level_id`, `attribute_id`),
    CONSTRAINT `fk_character_level_attributes_characters` FOREIGN KEY (`character_id`)
        REFERENCES `characters` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_character_level_attributes_levels` FOREIGN KEY (`level_id`)
        REFERENCES `levels` (`level_value`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_character_level_attributes_attributes` FOREIGN KEY (`attribute_id`)
        REFERENCES `attributes` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `elements` (
    `id` int AUTO_INCREMENT NOT NULL ,
    `name` VARCHAR(256)  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `element_relationships` (
    `element_id` INT NOT NULL,
    `strong_against_id` INT NOT NULL,
    `weak_against_id` INT NOT NULL,
    PRIMARY KEY (`element_id`, `strong_against_id`),
    CONSTRAINT `fk_element_strengths_element` FOREIGN KEY (`element_id`)
        REFERENCES `elements` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_element_strengths_strong` FOREIGN KEY (`strong_against_id`)
        REFERENCES `elements` (`id`)
        ON DELETE CASCADE
    CONSTRAINT `fk_element_strengths_weak` FOREIGN KEY (`weak_against_id`)
        REFERENCES `elements` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `character_elements` (
    `character_id` INT NOT NULL,
    `element_id` INT NOT NULL,
    PRIMARY KEY (`character_id`, `element_id`),
    CONSTRAINT `fk_character_elements_characters` FOREIGN KEY (`character_id`)
        REFERENCES `characters` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_character_elements_elements` FOREIGN KEY (`element_id`)
        REFERENCES `elements` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `battles` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `team_id` INT NOT NULL,
    `opponent_team_id` INT,  -- NULL if this is a boss fight
    `boss_id` INT,  -- NULL if this is a team fight
    `battle_date` DATETIME NOT NULL,
    `winner_id` INT,  -- Can be NULL initially
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_battles_initiating_teams` FOREIGN KEY (`team_id`)
        REFERENCES `teams` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_battles_opponent_teams` FOREIGN KEY (`opponent_team_id`)
        REFERENCES `teams` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_battles_bosses` FOREIGN KEY (`boss_id`)
        REFERENCES `characters` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `attacks` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `battle_id` INT NOT NULL,
    `attacker_id` INT NOT NULL, 
    `defender_id` INT NOT NULL,
    `damage` INT NOT NULL,
    `attack_time` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_attacks_battles` FOREIGN KEY (`battle_id`)
        REFERENCES `battles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attacks_attacker` FOREIGN KEY (`attacker_id`)
        REFERENCES `characters` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attacks_defender` FOREIGN KEY (`defender_id`)
        REFERENCES `characters` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

