var express = require("express");

var auth = require("../middlewares/auth");

var app = express();

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

//  =============  //
//  *Buscar Todo*  //
//  =============  //

app.get("/todo/:busqueda", (req, res) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(regex),
    buscarMedicos(regex),
    buscarUsuarios(regex),
  ]).then((response) => {
    res.status(200).json({
      ok: true,
      hospitales: response[0],
      medicos: response[1],
      usuarios: response[2],
    });
  });
});

function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar medicos", err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email role")
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

//  ========================  //
//  *Busqueda por colección*  //
//  ========================  //

app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var busqueda = req.params.busqueda;
  var tabla = req.params.tabla;
  var regex = new RegExp(busqueda, "i");

  var promesa;

  switch (tabla) {
    case "usuarios":
      promesa = buscarUsuarios(regex);

      break;

    case "medicos":
      promesa = buscarMedicos(regex);

      break;

    case "hospitales":
      promesa = buscarHospitales(regex);

      break;

    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los tipos de busqueda solo son: usuarios, medicos y hospitales",
        errors: { message: "Tipo de tabla no válido" },
      });
  }

  promesa.then((response) => {
    res.status(200).json({
      ok: true,
      [tabla]: response,
    });
  });
});

module.exports = app;
