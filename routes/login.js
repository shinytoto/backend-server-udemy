var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

const SEED = require("../config/config").SEED;

var app = express();

var Usuario = require("../models/usuario");

//  =========================  //
//  *Autenticación de Google*  //
//  =========================  //

app.post("/google", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch((err) => {
    return res.status(403).json({
      ok: false,
      mensaje: "Token no válido.",
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario.",
        errors: err,
      });

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe de usar su autenticación normal.",
        });
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400,
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
        });
      }
    } else {
      // El usuario no existe... hay que crearlo
      var usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = undefined;

      usuario.save((err, usuarioDB) => {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400,
        });

        return res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
        });
      });
    }
  });

  // return res.status(200).json({
  //   ok: true,
  //   mensaje: "Funciona.",
  //   googleUser: googleUser,
  // });
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload["sub"];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}
verify().catch(console.error);

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
