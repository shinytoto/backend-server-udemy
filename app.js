// Requires
var express = require("express");
var mongoose = require("mongoose");

// Inizializar variables
var app = express();

// Conexión a la base de datos
mongoose.connect(
  "mongodb://localhost:27017/hospitalDB",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos: \x1b[32m%s\x1b[0m", " online");
  }
);

// Routes
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Petición realizada correctamente.",
  });
});

// Listening
app.listen(3000, () => {
  console.log(
    "Express server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m",
    " online"
  );
});
