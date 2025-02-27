import { createServer } from "http";
import { WebSocketServer } from "ws";

const BLUESKY_API_URL = process.env.BLUESKY_API_URL;
const PORT = Number(process.env.WS_PORT);

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

async function getRandomPokemon() {
  const response = await fetch(`${BLUESKY_API_URL}/pokemon`);
  const jsonResponse = await response.json();
  return jsonResponse;
}

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const stringData = data.toString();
    const jsonData = JSON.parse(stringData);
    wss.clients.forEach((client) => {
      if (ws !== client) {
        client.send(stringData);
      }
    });
    if (jsonData.type !== "chat") {
      return;
    }
    getRandomPokemon()
      .then((data) => {
        const message = JSON.stringify({
          user: "bot",
          text: "",
          bot_data: data,
          type: "bot-message",
        });
        ws.send(message);
      })
      .catch(console.error);
  });
});

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

console.log(`Server listening on port ${PORT}`);
server.listen(Number(process.env.WS_PORT));
