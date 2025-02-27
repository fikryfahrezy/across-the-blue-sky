import { createServer } from "http";
import { WebSocketServer } from "ws";

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    wss.clients.forEach((client) => {
      if (ws !== client) {
        client.send(data.toString());
      }
    });
  });
});

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

const PORT = Number(process.env.WS_PORT);
console.log(`Server listening on port ${PORT}`);
server.listen(Number(process.env.WS_PORT));
