var express = require("express");

var auth = require("../middlewares/auth");

var app = express();

var Hospital = require("../models/hospital");

//  ==============================  //
//  *Obtener todos los hospitales*  //
//  ==============================  //

app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err)
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          errors: err,
        });

      Hospital.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          hospitales,
          totalItems: conteo,
        });
      });
    });
});

//  =========================  //
//  *Crear un nuevo hospital*  //
//  =========================  //

app.post("/", auth.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospitalGuardado) => {
    if (err)
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err,
      });

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
      usuarioToken: req.usuario,
    });
  });
});

//  =====================  //
//  *Actualizar Hospital*  //
//  =====================  //

app.put("/:id", auth.verificaToken, (req, res) => {
  var hospitalId = req.params.id;
  var body = req.body;

  Hospital.findById(hospitalId, (err, hospital) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err,
      });

    if (!hospital)
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con el id" + hospitalId + " no se encontró.",
        errors: { mensaje: "No existe un hospital con ese id." },
      });

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err)
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err,
        });

      res.status(201).json({
        ok: true,
        hospital: hospitalGuardado,
      });
    });
  });
});

//  ===================  //
//  *Eliminar hospital*  //
//  ===================  //

app.delete("/:id", auth.verificaToken, (req, res) => {
  var hospitalId = req.params.id;

  Hospital.findByIdAndRemove(hospitalId, (err, hospitalEliminado) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err,
      });

    if (!hospitalEliminado)
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un hospital con el id:" + hospitalId,
        errors: { mensaje: "No existe un hospital con ese id." },
      });

    res.status(200).json({
      ok: true,
      hospitalEliminado,
    });
  });
});

module.exports = app;
