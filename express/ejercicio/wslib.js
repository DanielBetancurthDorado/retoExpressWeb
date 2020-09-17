const WebSocket = require("ws");
const fs = require("fs");
const clients = [];

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    ws.on("message", (ob) => {
      //leo el archivo y lo pongo en array
      let info = JSON.parse(ob);
      fs.access("persistencia.json", fs.constants.F_OK, (err) => {
        if (err) {
          console.log("Se creara la persistencia formato JSON");
        }
        let data = fs.readFileSync('persistencia.json');
          let ob =
          {
            message: info.mensaje,
            author: info.autor,
            ts: info.tiempo,
          }
          let contenido = data.toString();
          if(contenido.length===2)
          {
            contenido = contenido.replace(']', `{ "message": "${ob.message}" ,"author": "${ob.author}","ts": "${ob.ts}"}]`)

          }
          else{
            contenido = contenido.replace(']', `,{ "message": "${ob.message}" ,"author": "${ob.author}","ts": "${ob.ts}"}]`)
          }
          fs.writeFile("persistencia.json",contenido,()=>{});
          sendMessages();
      });

    });
  });
};
//clients no tocar
//modificar messages
const sendMessages = () => {
  let messages = [];
  let content = fs.readFileSync("persistencia.json");
  fs.readFile("persistencia.json",(err,data)=>
  {
    let jFormat = JSON.parse(data);
    jFormat.forEach(element=>
      {
        messages.push(element.message);
      })
    clients.forEach((client) => client.send(JSON.stringify(messages)));
  })
};

exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;
