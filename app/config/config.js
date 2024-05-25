module.exports = {
  development: {
    username: "root",
    password: "root",
    database: "team_dynamics",
    host: "mysql",
    port: 3307,
    dialect: "mysql"
  },
  local: {
    username: "root",
    password: "root",
    database: "team_dynamics",
    host: "localhost",
    port: 3307,
    dialect: "mysql"
  },
  production: {
    username: "user",
    password: "root",
    database: "team_dynamics",
    host: "mysql",
    dialect: "mysql"
  }
};
