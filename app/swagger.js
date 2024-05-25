const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const express = require("express");

const app = express();

// Define the Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Team Dynamics Motor Documentation",
      version: "1.0.0",
      description: "Public API for TDM",
    },
    servers: [
      {
        url: "http://localhost:5000", 
        description: "TDM API",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

// Initialize Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
