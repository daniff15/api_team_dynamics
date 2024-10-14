# Team Dynamics

Team Dynamics is an API-driven platform designed to manage and interact with characters, teams, and game dynamics. This application allows users to perform various operations such as creating characters, assigning them to teams, managing character attributes, and more. The platform is configurable and can be customized to fit different game mechanics and rules.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Character Management:** Create, update, and manage characters with various attributes and elements.
- **Team Management:** Create and manage teams, assign characters to teams, and handle team dynamics.
- **Game Mechanics:** Implement complex game mechanics including level progression, attribute adjustments, and battle scenarios.
- **Configurable Environment:** Easily adjust game variables to customize the gameplay experience.

## Technologies Used
- **Node.js:** Backend runtime environment.
- **Express.js:** Web framework for Node.js.
- **Sequelize:** ORM for database management.
- **Swagger:** API documentation.
- **Docker:** Containerization for easy deployment.

## Getting Started

### Prerequisites
- **Node.js**
- **NPM** 
- **Docker** 

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/daniff15/api_team_dynamics
    cd api_team_dynamics
    ```

2. Set up environment variables by creating a `.env` file based on the example provided:
    ```sh
    cp .env.example .env
    ```

3. Update the `.env` file with your configuration settings.

## Environment Variables
Explanation about the environment variables:

1. Ensure your `.env` file is properly configured. An example `.env` file might look like this:

    ```plaintext
    # Application configuration
    PORT=5000

    # Database configuration
    MYSQL_USER=root #default
    MYSQL_ROOT_PASSWORD=password #default
    MYSQL_DATABASE=YOUR_MYSQL_DATABASE
    MYSQL_HOST=mysql
    MYSQL_PORT=3306
    MYSQL_DIALECT=mysql

    # Game configuration (This are the default values for the game to work properly)
    # You can change them if you want to modify the game behavior (Always test the game after changing these values - more information about the game configuration in the README.md file)
    CRITICAL_HIT_PROBABILITY=0.1
    STRONG_ATTACK=1.5
    WEAK_ATTACK=0.5
    MAX_FIRST_FORMULA_LEVEL=9
    BASE_XP=100
    INCREMENT=50
    SEC_FORMULA_INCREMENT=500
    INCREMENT_ATTS_FACTOR=0.11
    ```

    The platform uses various configuration variables to control game mechanics. These variables can be adjusted in the `.env` file:

    Battle Variables:
    - **CRITICAL_HIT_PROBABILITY**: Probability of a critical hit occurring (0.1 = 10% probability).
    - **STRONG_ATTACK**: Multiplier for a strong attack.
    - **WEAK_ATTACK**: Multiplier for a weak attack.

    Player evolution Variables:
    - **MAX_FIRST_FORMULA_LEVEL**: Maximum level for the first formula. Level from where the second formula will be activated - From a certain level it was taking too much XP to level up.
    - **BASE_XP**: Base experience points for leveling from level 1 to 2.
    - **INCREMENT**: Incremental XP added per level (Supposing BASE_XP is 100, to level up from level 2 to level 3, it will take (100 + INCREMENT)XP to level up, and so on, always increasing the INCREMENT to the previous needed value).
    - **SEC_FORMULA_INCREMENT**: Increment needed to level up when the player passes the MAX_FIRST_FORMULA_LEVEL.
    - **INCREMENT_ATTS_FACTOR**: Factor for incrementing attributes.
    - **GAIN_XTRA_POINTS_PROBABILITY**: Probability of gaining extra points when leveling up the player.

The application will be available at `http://localhost:5001`.

### Running the Application
To start the application with Docker:
1. Build the Docker image:
    ```sh
    docker compose up --build
    ```

## API Documentation
The API is documented using Swagger. Once the application is running, you can access the documentation at:
http://localhost:5001/api-docs

## Scripts Execution (Testing proposes)
•	flow.py: Creates and simulates two teams to defeat all bosses.

•	count_badges.py: Calculates the median badges needed for each team to win.

•	cleanup.py: Deletes records from the database for rerunning the scripts.


```sh
    cd scripts

    # create a virtual environment
    python3 -m venv venv
    source venv/bin/activate

    # run the scripts
    python3 cleanup.py
    python3 flow.py
    python3 count_badges.py
```

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any features, improvements, or bug fixes.

### Steps to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
