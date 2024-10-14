import mysql.connector
from mysql.connector import Error

# Database connection details
DB_HOST = 'localhost'  # Change to the IP address of your Docker container if needed
DB_PORT = 3309         # Default MySQL port
DB_USER = 'root'       
DB_PASSWORD = 'password'   # Your MySQL password
DB_NAME = 'team_dynamics'  # Your database name

def clear_character_level_attributes():
    try:
        # Establish a database connection
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        
        if connection.is_connected():
            print("Connected to MySQL Server version:", connection.get_server_info())

            # Create a cursor object
            cursor = connection.cursor()

            # Update level_id for characters with IDs from 1 to 8
            cursor.execute("""
                UPDATE characters 
                SET level_id = 1 
                WHERE id BETWEEN 1 AND 8;
            """)
            print("level_id updated for characters with IDs from 1 to 8.")

            # Reset total_xp for all players to 0
            cursor.execute("""
                UPDATE players 
                SET total_xp = 0, 
                    xp = 0, 
                    att_xtra_points = 0;
            """)
            print("total_xp, xp, and att_xtra_points reset to 0 for all players.")

            cursor.execute("""
                DELETE FROM character_level_attributes 
                WHERE character_id BETWEEN 1 AND 8 AND level_id <> 1;
            """)
            print("character_level_attributes deleted for characters with IDs from 1 to 8.")

            # Commit the transaction to save changes
            connection.commit()

            cursor.close()
            print("Cursor closed.")
            
    except Error as e:
        print("Error while connecting to MySQL:", e)
    finally:
        # Ensure the connection is closed
        if connection is not None and connection.is_connected():
            connection.close()
            print("MySQL connection is closed.")

if __name__ == "__main__":
    clear_character_level_attributes()

    #Delete game_log.txt file
    import os
    if os.path.exists("game_log.txt"):
        os.remove("game_log.txt")
        print("game_log.txt file deleted.")
    else:
        print("game_log.txt file does not exist.")