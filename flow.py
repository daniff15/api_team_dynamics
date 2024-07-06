import requests
import random
import json
import time

# Configuration
TEAM_1 = "1"
TEAM_2 = "2"
ENDPOINT_BASE_URL = "http://localhost:5000/"
LOG_FILE = "game_log.txt"
MAX_BADGES = 2

# Initialize log file
with open(LOG_FILE, "w") as log_file:
    log_file.write("Game Simulation Log\n")

# Function to call an endpoint
def call_endpoint(endpoint, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    url = ENDPOINT_BASE_URL + endpoint
    
    if method == "GET":
        response = requests.get(url)
    elif method == "PUT":
        response = requests.put(url, headers=headers, json=data)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    return response.json() if response.ok else None

# Function to allocate badges and XP to players
def allocate_badges_and_xp(team_id, num_players, round_num):
    for i in range(1, num_players + 1):
        player_id = i + (int(team_id) - 1) * num_players
        badges = 1
        xp = badges * 175
        
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Round {round_num}: Team {team_id} - Player {player_id} received {badges} badges ({xp} XP)\n")
        
        data = {"XP": xp}
        call_endpoint(f"characters/{player_id}/xp", "PUT", data)

# Function to simulate boss battle
def attempt_boss_defeat(team_id, round_num):
    response = call_endpoint(f"games/odds/{team_id}", "GET")
    if response is None or "data" not in response:
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Round {round_num}: Team {team_id} - Error: Empty or malformed response from API\n")
        return 0

    data = response["data"]
    if not data or len(data) == 0:
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Round {round_num}: Team {team_id} - Error: No data found in response from API\n")
        return 0

    first_boss = data[0]
    probability = first_boss.get("win_rate", None)
    filtered_data = [boss for boss in data if boss['win_rate'] < 1]
    bosses_left = len(filtered_data)

    if probability is None:
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Round {round_num}: Team {team_id} - Error: Unable to fetch probability from API response\n")
        return bosses_left

    if probability > 0.98:
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Response from API: {response}\n")

        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Round {round_num}: Team {team_id} defeated the boss!\n")

    return bosses_left

# Main game loop
def main_game_loop():
    round_num = 1
    num_players_team1 = 4
    num_players_team2 = 4
    bosses_left_team1 = 1
    bosses_left_team2 = 1

    while bosses_left_team1 > 0 or bosses_left_team2 > 0:
        print(f"Loading round...")
        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"Starting Round {round_num}\n")

        bosses_left_team1 = attempt_boss_defeat(TEAM_1, round_num)
        bosses_left_team2 = attempt_boss_defeat(TEAM_2, round_num)
        
        if (bosses_left_team1 != 0 ):
            allocate_badges_and_xp(TEAM_1, num_players_team1, round_num)
        if (bosses_left_team2 != 0 ):
            allocate_badges_and_xp(TEAM_2, num_players_team2, round_num)

        with open(LOG_FILE, "a") as log_file:
            log_file.write(f"End of Round {round_num}\n")

        round_num += 1

    with open(LOG_FILE, "a") as log_file:
        log_file.write("Both teams have defeated all bosses. Ending game.\n")

# Start the game simulation
if __name__ == "__main__":
    main_game_loop()
