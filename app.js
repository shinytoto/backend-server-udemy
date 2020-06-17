// Requires
var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");

// Routes
app.use("/usuario", usuarioRoutes);
app.use("/", appRoutes);

module.exports = app;
