// Requires
var mongoose = require("mongoose");
var app = require("./app");
var port = 3000;

// Conexión a la base de datos
mongoose.connect(
  "mongodb://localhost:27017/hospitalDB",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos: \x1b[32m%s\x1b[0m", " online");
  }
);

// Listening
app.listen(port, () => {
  console.log(
    "Express server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m",
    " online"
  );
});
