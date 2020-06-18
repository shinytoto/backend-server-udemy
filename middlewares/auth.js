var jwt = require("jsonwebtoken");

const SEED = require("../config/config").SEED;

//  =================  //
//  *Verificar Token*  //
//  =================  //

exports.verificaToken = function (req, res, next) {
  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err)
      return res.status(401).json({
        ok: false,
        mensaje: "Token inválido",
        errors: err,
      });

    req.usuario = decoded.usuario;

    next();

    // res.status(200).json({
    //   ok: true,
    //   deoded: decoded,
    // });
  });
};
