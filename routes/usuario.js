var express = require("express");
var bcrypt = require("bcryptjs");

var auth = require("../middlewares/auth");

var app = express();

var Usuario = require("../models/usuario");

//  ============================  //
//  *Obtener todos los usuarios*  //
//  ============================  //

app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err)
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando usuarios",
          errors: err,
        });

      Usuario.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          usuarios,
          totalItems: conteo,
        });
      });
    });
});

//  ========================  //
//  *Crear un nuevo usuario*  //
//  ========================  //

app.post("/", (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err)
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err,
      });

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario,
    });
  });
});

//  ====================  //
//  *Actualizar Usuario*  //
//  ====================  //

app.put("/:id", auth.verificaToken, (req, res) => {
  var userId = req.params.id;
  var body = req.body;

  Usuario.findById(userId, (err, usuario) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
      });

    if (!usuario)
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el id" + userId + " no se encontró.",
        errors: { mensaje: "No existe un usuario con ese id." },
      });

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err)
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err,
        });

      res.status(201).json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});

//  ==================  //
//  *Eliminar usuario*  //
//  ==================  //

app.delete("/:id", auth.verificaToken, (req, res) => {
  var userId = req.params.id;

  Usuario.findByIdAndRemove(userId, (err, usuarioEliminado) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err,
      });

    if (!usuarioEliminado)
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con el id:" + userId,
        errors: { mensaje: "No existe un usuario con ese id." },
      });

    res.status(200).json({
      ok: true,
      usuarioEliminado,
    });
  });
});

module.exports = app;
