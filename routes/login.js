var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const SEED = require("../config/config").SEED;

var app = express();

var Usuario = require("../models/usuario");

//  ====================  //
//  *Loguear al usuario*  //
//  ====================  //

app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuarios",
        errors: err,
      });

    if (!usuarioDB)
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales Incorrectas - email",
        errors: err,
      });

    if (!bcrypt.compareSync(body.password, usuarioDB.password))
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales Incorrectas - password",
        errors: err,
      });

    usuarioDB.password = undefined;

    // Crear un token jwt

    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
    });
  });
});

module.exports = app;
