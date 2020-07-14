var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

var app = express();

// default option
app.use(fileUpload());

//  ========  //
//  *Upload*  //
//  ========  //

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colección

  var tiposValidos = ["hospitales", "medicos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0)
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de colección no válida.",
      errors: {
        mensaje:
          "Los tipos de colecciones válidas son: " +
          tiposValidos.join(", ") +
          ".",
      },
    });

  if (!req.files)
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada.",
      errors: { mensaje: "Debe de seleccionar una imagen." },
    });

  // Obtener nombre del archivo

  var archivo = req.files.imagen;
  var cutName = archivo.name.split(".");
  var extArchivo = cutName[cutName.length - 1];

  // Extensiones válidas

  var extValidas = ["png", "jpg", "jpeg", "gif"];

  if (extValidas.indexOf(extArchivo) < 0)
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no válida.",
      errors: {
        mensaje: "Las extensiones válidas son: " + extValidas.join(", ") + ".",
      },
    });

  // Nombre de archivo personalizado

  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extArchivo}`;

  // Mover el archivo del temporal a un path especifico

  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo.",
        errors: err,
      });
  });

  subirPorTipo(tipo, id, nombreArchivo, res);
});

// * Subir imagen por tipo

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        res.status(400).json({
          ok: false,
          mensaje: "Usuario no existe.",
          errors: { mensaje: "El usuario con el id: " + id + " no existe." },
        });
        return eliminarImagen(res, oldPath, "Error");
      }

      var oldPath = "./uploads/usuarios/" + usuario.img;

      // Si existe, elimina la imagen antigua
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          return console.log(err);
        });
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = undefined;
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada.",
          usuario: usuarioActualizado,
        });
      });
    });
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: "Médico no existe.",
          errors: { mensaje: "El médico con el id: " + id + " no existe." },
        });
      }
      var oldPath = "./uploads/medicos/" + medico.img;

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          return console.log(err);
        });
      }

      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de medico actualizada.",
          medico: medicoActualizado,
        });
      });
    });
  }
  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: "Hospital no existe.",
          errors: { mensaje: "El hospital con el id: " + id + " no existe." },
        });
      }
      var oldPath = "./uploads/hospitales/" + hospital.img;

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          return console.log(err);
        });
      }

      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de hospital actualizada.",
          hospital: hospitalActualizado,
        });
      });
    });
  }
}

// * Eliminar imagen de error

function eliminarImagen(res, oldPath, mensaje) {
  fs.unlink(oldPath, (err) => {
    return res.status(400).send({
      ok: false,
      mensaje: mensaje,
      errors: err,
    });
  });
}

module.exports = app;
