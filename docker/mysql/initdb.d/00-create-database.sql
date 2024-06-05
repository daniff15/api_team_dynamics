CREATE DATABASE IF NOT EXISTS team_dynamics;
SET GLOBAL sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '');
SET SESSION group_concat_max_len = 10000; 
SET GLOBAL time_zone = '+00:00';
SET SESSION time_zone = '+00:00';

