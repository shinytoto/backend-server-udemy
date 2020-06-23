var express = require("express");

var app = express();

const path = require("path");
const fs = require("fs");

//  ================  //
//  *Obtener Imagen*  //
//  ================  //

app.get("/:tipo/:img", (req, res, next) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
  var pathNoImagen = path.resolve(__dirname, "../assets/no-img.jpg");

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    res.sendFile(pathNoImagen);
  }
});

module.exports = app;
