import app from "./app.js";
import "dotenv/config.js";
import http from "http";
import colors from "colors";
const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Server is listining to port : ${process.env.PORT}`.rainbow);
});
