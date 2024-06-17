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
- **Node.js** (v16.x or later)
- **NPM** (v6.x or later)
- **Docker** (optional, for containerized deployment)

### Installation - FAZER ISTO PARA O ENV FILE
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/team-dynamics.git
    cd team-dynamics
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables by creating a `.env` file based on the example provided:
    ```sh
    cp .env.example .env
    ```

4. Update the `.env` file with your configuration settings.

### Running the Application - MUDAR ISTO PARA CORRER COM O ENV FILE CERTO
To start the application with Docker:
1. Build the Docker image:
    ```sh
    docker build -t team-dynamics .
    ```

2. Run the Docker container:
    ```sh
    docker run -d -p 5000:3000 --env-file .env team-dynamics
    ```

The API will be available at `http://localhost:5000`.

## Configuration - SE CALHAR EXPLICAR MELHOR AS FORMULAS
The platform uses various configuration variables to control game mechanics. These variables can be adjusted in the `app/config/variables.json` file:

```json
{
    "CRITICAL_HIT_PROBABILITY": 0.1,
    "STRONG_ATTACK": 1.5,
    "WEAK_ATTACK": 0.5,
    "MAX_FIRST_FORMULA_LEVEL": 9,
    "BASE_XP": 100,
    "INCREMENT": 50,
    "SEC_FORMULA_INCREMENT": 500,
    "INCREMENT_ATTS_FACTOR": 0.11
}
```

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

## API Documentation
The API is documented using Swagger. Once the application is running, you can access the documentation at:
http://localhost:5000/api-docs


## Docker Deployment - MUDAR ISTO
To deploy the application using Docker:

1. Build the Docker image:
    ```sh
    docker build -t team-dynamics .
    ```

2. Run the Docker container:
    ```sh
    docker run -d -p 5000:3000 --env-file .env team-dynamics
    ```

The application will be available at `http://localhost:5000`.

<!-- ## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any features, improvements, or bug fixes.

### Steps to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. -->
