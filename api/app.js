import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

import routerUsers from "./routes/users.js";
import routerFriends from "./routes/friends.js";
import routerConversations from "./routes/conversations.js";
import routerModeration from "./routes/moderation.js";
import routerErrors from "./routes/errors.js";
import routerSav from "./routes/sav.js";
import routerReunions from "./routes/reunions.js";
import routerPush from "./routes/push.js";

import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://vaalgtir:I7afakuO25hpzVNe@cluster0.pjtzd.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log("Connexion à MongoDB échouée : ", err));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    `${process.env.ACCESS_CONTROL_ALLOW_ORIGIN}`
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, CSRF-Token"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use("/users", routerUsers);
app.use("/friends", routerFriends);
app.use("/conversations", routerConversations);
app.use("/moderation", routerModeration);
app.use("/errors", routerErrors);
app.use("/sav", routerSav);
app.use("/reunions", routerReunions);
app.use("/push", routerPush);

export default app;
