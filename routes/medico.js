var express = require("express");

var auth = require("../middlewares/auth");

var app = express();

var Medico = require("../models/medico");

//  ===========================  //
//  *Obtener todos los médicos*  //
//  ===========================  //

app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err)
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar médicos",
          errors: err,
        });

      Medico.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          medicos,
          totalItems: conteo,
        });
      });
    });
});

//  =======================  //
//  *Crear un nuevo médico*  //
//  =======================  //

app.post("/", auth.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  medico.save((err, medicoGuardado) => {
    if (err)
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear médico",
        errors: err,
      });

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
    });
  });
});

//  ===================  //
//  *Actualizar Médico*  //
//  ===================  //

app.put("/:id", auth.verificaToken, (req, res) => {
  var medicoId = req.params.id;
  var body = req.body;

  Medico.findById(medicoId, (err, medico) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar médico",
        errors: err,
      });

    if (!medico)
      return res.status(400).json({
        ok: false,
        mensaje: "El médico con el id" + medicoId + " no se encontró.",
        errors: { mensaje: "No existe un médico con ese id." },
      });

    (medico.nombre = body.nombre),
      (medico.usuario = req.usuario._id),
      (medico.hospital = body.hospital);

    medico.save((err, medicoActualizado) => {
      if (err)
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar médico",
          errors: err,
        });

      res.status(201).json({
        ok: true,
        medico: medicoActualizado,
      });
    });
  });
});

//  =================  //
//  *Eliminar médico*  //
//  =================  //

app.delete("/:id", auth.verificaToken, (req, res) => {
  var medicoId = req.params.id;

  Medico.findByIdAndRemove(medicoId, (err, medicoEliminado) => {
    if (err)
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar médico",
        errors: err,
      });

    if (!medicoEliminado)
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un médico con el id" + medicoId,
        errors: { mensaje: "No existe un médico con ese id" },
      });

    res.status(200).json({
      ok: true,
      medicoEliminado,
    });
  });
});

module.exports = app;
