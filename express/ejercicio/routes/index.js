var express = require("express");
var router = express.Router();
const ws = require("../wslib");
const Joi = require("joi");
const fs = require("fs");

express().listen(300, () => console.log("Listening on port 3000"));
express().use(express.json());

const clients = [];
/* GET home page. */
router.get("/chat/api/messages", function (req, res, next) {
  fs.readFile("persistencia.json", (err, data) => {
    let jFormat = JSON.parse(data);
    res.send(jFormat);
  });
});

router.get("/chat/api/messages/:id", function (req, res, next) {
  fs.readFile("persistencia.json", (err, data) => {
    let jFormat = JSON.parse(data);
    let mensaje;
    jFormat.forEach((element) => {
      if (element.ts == parseInt(req.params.id)) {
        mensaje = element;
      }
    });
    if (!mensaje)
      return res
        .status(404)
        .send("The message with the given ts was not found");
    res.send(mensaje);
  });
});

router.post("/chat/api/messages", function (req, res) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .pattern(new RegExp("([A-Za-z0-9.-]+[ ][A-Za-z0-9. -]+)"))
      .required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send("We can not post the message");
  }
  const mensaje = {
    message: req.body.message,
    author: req.body.author,
    ts: new Date().getTime(),
  };
  let data = fs.readFileSync("persistencia.json");
  let contenido = data.toString();
  if (contenido.length === 2) {
    contenido = contenido.replace(
      "]",
      `{ "message": "${mensaje.message}" ,"author": "${mensaje.author}","ts": "${mensaje.ts}"}]`
    );
  } else {
    contenido = contenido.replace(
      "]",
      `,{ "message": "${mensaje.message}" ,"author": "${mensaje.author}","ts": "${mensaje.ts}"}]`
    );
  }
  fs.writeFile("persistencia.json", contenido, () => {});
  ws.sendMessages();
  res.send(mensaje);
  //clients.push(mensaje);
});

router.put("/chat/api/messages/:id", (req, res) => {
  //validar id
  let data = fs.readFileSync("persistencia.json");
  let jFormat = JSON.parse(data);
  let mensaje;
  jFormat.forEach((element) => {
    if (element.ts == parseInt(req.params.id)) {
      mensaje = element;
    }
  });
  if (!mensaje)
    return res.status(404).send("The message with the given ts was not found");
  //validar body
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .pattern(new RegExp("([A-Za-z0-9.-]+[ ][A-Za-z0-9. -]+)"))
      .required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send("We can not post the message");
  }
  //actualizar
  mensaje.message = req.body.message;
  mensaje.author = req.body.author;
  //Actualizar persistencia.json
  let texto = "[";
  jFormat.forEach((e) => {
    if (texto.length === 1) {
      texto += `{ "message": "${e.message}" ,"author": "${e.author}","ts": "${e.ts}"}`;
    } else {
      texto += `,{ "message": "${e.message}" ,"author": "${e.author}","ts": "${e.ts}"}`;
    }
  });
  texto += "]";
  console.log("Texto " + texto);
  fs.writeFile("persistencia.json", texto, () => {});
  //enviar respuesta
  ws.sendMessages();
  res.send(mensaje);
});

router.delete("/chat/api/messages/:id", (req, res) => {
  //validar id
  let data = fs.readFileSync("persistencia.json");
  let jFormat = JSON.parse(data);
  let mensaje;
  jFormat.forEach((element) => {
    if (element.ts == parseInt(req.params.id)) {
      mensaje = element;
    }
  });
  if (!mensaje)
    return res.status(404).send("The message with the given ts was not found");
  const index = jFormat.indexOf(mensaje);
  jFormat.splice(index, 1);
  let texto = "[";
  jFormat.forEach((e) => {
    if (texto.length === 1) {
      texto += `{ "message": "${e.message}" ,"author": "${e.author}","ts": "${e.ts}"}`;
    } else {
      texto += `,{ "message": "${e.message}" ,"author": "${e.author}","ts": "${e.ts}"}`;
    }
  });
  texto += "]";
  console.log("Texto " + texto);
  fs.writeFile("persistencia.json", texto, () => {});
  ws.sendMessages();
  res.send(mensaje);
});
router;
module.exports = router;
