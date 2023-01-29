let clients = [];

export const subscribe = (req, res, next) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  const id = Date.now();

  const newClient = {
    id,
    response: res,
  };

  clients.push(newClient);

  for (const client of clients) {
    client.response.write(`data: ${JSON.stringify(`Connected`)}\n\n`);
  }

  res.socket.on("close", () => {
    clients = clients.filter((client) => client.id !== id);
    console.log("closed", clients.length);
  });
};

export const pushMessage = (req, res, next) => {
  clients.forEach((client) => {
    client.response.write(`data: ${`${req.body.message}`}\n\n`);
  });
};
