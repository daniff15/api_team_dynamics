from statistics import median  # Import the median function

def count_badges_per_player(log_file_path):
    with open(log_file_path, 'r') as log_file:
        lines = log_file.readlines()

    player_badges = {}
    current_round = 0

    for line in lines:
        line = line.strip()
        if line.startswith("Starting Round"):
            current_round += 1
        elif f"Round {current_round}" in line and "received" in line:
            # Extract player ID and badges received
            tokens = line.split()
            team_id = int(tokens[3])
            player_id = int(tokens[6])
            badges_str = tokens[8]  # e.g., "3 badges (300 XP)"

            # Extract number of badges received
            badges = int(badges_str)

            # Accumulate badges received for each player
            player_key = (team_id, player_id)
            if player_key not in player_badges:
                player_badges[player_key] = []

            player_badges[player_key].append(badges)

    return player_badges


# Example usage:
log_file_path = 'game_log.txt'
player_badges = count_badges_per_player(log_file_path)
team_badges = {} 

for player_key, badges_list in player_badges.items():
  team_id, player_id = player_key
  total_badges = sum(badges_list)

  # Ensure team data exists, create a new entry if not
  team_badges.setdefault(team_id, []).append(total_badges)

# After the loop, print the median for each team
for team_id, badge_list in team_badges.items():
  print(f"Team {team_id} - Median Badges: {team_median}")

# Print the results
# print("Player Badges:")
# for player_key, badges_list in player_badges.items():
#     team_id, player_id = player_key
#     total_badges = sum(badges_list)
#     print(f"Team {team_id} - Player {player_id}: {total_badges} badges")