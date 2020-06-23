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
var loginRoutes = require("./routes/login");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");

// Serve-Index config
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// Routes
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagenesRoutes);
app.use("/", appRoutes);

module.exports = app;
