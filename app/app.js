const express = require("express");
const { sequelize } = require("./models/index");
const gamesRoutes = require("./routes/games");
const teamsRoutes = require("./routes/teams");
const charactersRoutes = require("./routes/characters");
const battlesRoutes = require("./routes/battles");
const utilsRoutes = require("./routes/utils");
const appSwagger = require("./swagger");
const cors = require("cors"); // Importing cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

console.log("process.env.node_port:", process.env.PORT);

// Configure CORS
const corsOptions = {
  origin: "http://your-frontend-domain.com", // Replace with your frontend domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable credentials, if you need to include cookies or other credentials in cross-origin requests.
};

app.use(cors(corsOptions)); // Enable CORS with specified options

app.use(express.json());
app.use(appSwagger);

app.get("/", (req, res) => {
  try {
    const rows = "Hello World";
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.use("/games", gamesRoutes);
app.use("/teams", teamsRoutes);
app.use("/characters", charactersRoutes);
app.use("/battles", battlesRoutes);
app.use("/utils", utilsRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
