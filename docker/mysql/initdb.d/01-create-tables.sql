-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS team_dynamics;
CREATE DATABASE team_dynamics;
USE team_dynamics;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema team_dynamics
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema team_dynamics
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `team_dynamics` DEFAULT CHARACTER SET latin1 ;
USE `team_dynamics` ;

-- -----------------------------------------------------
-- Table `team_dynamics`.`character_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`character_types` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`levels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`levels` (
  `level_value` INT(11) NOT NULL,
  PRIMARY KEY (`level_value`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`characters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`characters` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `character_type_id` INT(11) NOT NULL,
  `level_id` INT(11) NOT NULL,
  `image_path` VARCHAR(256) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_characters_character_types`
    FOREIGN KEY (`character_type_id`)
    REFERENCES `team_dynamics`.`character_types` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_characters_levels`
    FOREIGN KEY (`level_id`)
    REFERENCES `team_dynamics`.`levels` (`level_value`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`bosses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`bosses` (
  `id` INT(11) NOT NULL,
  `before_defeat_phrase` VARCHAR(256) NULL,
  `after_defeat_phrase` VARCHAR(256) NULL,
  `cooldown_time` INT(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_characters_copy1_1`
    FOREIGN KEY (`id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`games`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`games` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`teams`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`teams` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `community_id_ext` VARCHAR(256) NOT NULL,
  `game_id` INT(11) NOT NULL,
  `owner_id` INT(11) NOT NULL,
  `total_xp` INT(11) NOT NULL DEFAULT '0',
  `team_image_path` VARCHAR(256) NULL DEFAULT NULL,
  `cooldown_time` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_teams_games`
    FOREIGN KEY (`game_id`)
    REFERENCES `team_dynamics`.`games` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_teams_players`
    FOREIGN KEY (`owner_id`)
    REFERENCES `team_dynamics`.`players` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`battles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`battles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `team_id` INT(11) NOT NULL,
  `opponent_team_id` INT(11) NULL DEFAULT NULL,
  `boss_id` INT(11) NULL DEFAULT NULL,
  `battle_date` TIMESTAMP NOT NULL,
  `winner_id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_battles_bosses`
    FOREIGN KEY (`boss_id`)
    REFERENCES `team_dynamics`.`bosses` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_battles_initiating_teams`
    FOREIGN KEY (`team_id`)
    REFERENCES `team_dynamics`.`teams` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_battles_opponent_teams`
    FOREIGN KEY (`opponent_team_id`)
    REFERENCES `team_dynamics`.`teams` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`attacks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`attacks` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `battle_id` INT(11) NOT NULL,
  `attacker_id` INT(11) NOT NULL,
  `defender_id` INT(11) NOT NULL,
  `damage` INT(11) NOT NULL,
  `attack_time` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attacks_attacker`
    FOREIGN KEY (`attacker_id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_attacks_battles`
    FOREIGN KEY (`battle_id`)
    REFERENCES `team_dynamics`.`battles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_attacks_defender`
    FOREIGN KEY (`defender_id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`attributes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`elements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`elements` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`character_elements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`character_elements` (
  `character_id` INT(11) NOT NULL,
  `element_id` INT(11) NOT NULL,
  PRIMARY KEY (`character_id`, `element_id`),
  CONSTRAINT `fk_character_elements_characters`
    FOREIGN KEY (`character_id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_character_elements_elements`
    FOREIGN KEY (`element_id`)
    REFERENCES `team_dynamics`.`elements` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`character_level_attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`character_level_attributes` (
  `character_id` INT(11) NOT NULL,
  `level_id` INT(11) NOT NULL,
  `attribute_id` INT(11) NOT NULL,
  `value` INT(11) NOT NULL,
  PRIMARY KEY (`character_id`, `level_id`, `attribute_id`),
  CONSTRAINT `fk_character_level_attributes_attributes`
    FOREIGN KEY (`attribute_id`)
    REFERENCES `team_dynamics`.`attributes` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_character_level_attributes_characters`
    FOREIGN KEY (`character_id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_character_level_attributes_levels`
    FOREIGN KEY (`level_id`)
    REFERENCES `team_dynamics`.`levels` (`level_value`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`element_relationships`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`element_relationships` (
  `element_id` INT(11) NOT NULL,
  `strong_against_id` INT(11) NOT NULL,
  `weak_against_id` INT(11) NOT NULL,
  PRIMARY KEY (`element_id`, `strong_against_id`),
  CONSTRAINT `fk_element_strengths_element`
    FOREIGN KEY (`element_id`)
    REFERENCES `team_dynamics`.`elements` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_element_strengths_strong`
    FOREIGN KEY (`strong_against_id`)
    REFERENCES `team_dynamics`.`elements` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_element_strengths_weak`
    FOREIGN KEY (`weak_against_id`)
    REFERENCES `team_dynamics`.`elements` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`players`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`players` (
  `id` INT(11) NOT NULL,
  `xp` INT(11) NULL DEFAULT '0',
  `total_xp` INT(11) NULL DEFAULT '0',
  `att_xtra_points` INT(11) NULL DEFAULT '0',
  `ext_id` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`, `ext_id`),
  CONSTRAINT `fk_players_1`
    FOREIGN KEY (`id`)
    REFERENCES `team_dynamics`.`characters` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`team_players`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`team_players` (
  `team_id` INT(11) NOT NULL,
  `player_id` INT(11) NOT NULL,
  PRIMARY KEY (`team_id`, `player_id`),
  CONSTRAINT `fk_team_characters_characters`
    FOREIGN KEY (`player_id`)
    REFERENCES `team_dynamics`.`players` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_team_characters_teams`
    FOREIGN KEY (`team_id`)
    REFERENCES `team_dynamics`.`teams` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_dynamics`.`games_bosses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_dynamics`.`games_bosses` (
  `game_id` INT(11) NOT NULL AUTO_INCREMENT,
  `boss_id` INT(11) NOT NULL,
  PRIMARY KEY (`game_id`, `boss_id`),
  CONSTRAINT `fk_games_bosses_1`
    FOREIGN KEY (`boss_id`)
    REFERENCES `team_dynamics`.`bosses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_games_bosses_2`
    FOREIGN KEY (`game_id`)
    REFERENCES `team_dynamics`.`games` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
