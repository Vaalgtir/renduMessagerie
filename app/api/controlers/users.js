import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sgmail from "@sendgrid/mail";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { errorManagement as Error } from "../security_public/error.js";
import { sendConfirmMail } from "../utils/mail/templates.js";

export const login = (req, res, next) => {
  const mailReq = req.body.mail;
  const passReq = req.body.password;

  if (mailReq) {
    prisma.users
      .findUniqueOrThrow({
        where: {
          mail: mailReq,
        },
      })
      .then((results) => {
        bcrypt.compare(passReq, results.password).then((valid) => {
          if (!valid) {
            Error(res, 401, "Utilisateur ou mot de passe incorrect");
          } else {
            console.log(results.username, "s'est connecté");

            let privilege = "";

            if (results.isAdmin === 1) {
              privilege = "admin";
            } else {
              privilege = "member";
            }

            res.status(200).json({
              id: results.id,
              username: results.username,
              Nom: results.nom,
              Prenom: results.prenom,
              mail: results.mail,
              isAdmin: results.isAdmin,
              isValidated: results.isValidated,
              isBannished: results.isBannished,
              isSalesman: results.isSalesman,
              accessToken: jwt.sign(
                {
                  id: results.id,
                  username: results.username,
                  isAdmin: results.isAdmin,
                },
                process.env.CRYPT_KEY,
                { expiresIn: "24h" }
              ),
            });
          }
        });
      })
      .catch((err) => {
        console.log("login", err);
        Error(res, 404, "Utilisateur inconnu");
      });
  } else {
    Error(res, 500, "Entrez un nom d'utilisateur et un mot de passe");
  }
};

export const createUser = (req, res, next) => {
  const user = { ...req.body, id: undefined };
  bcrypt.hash(user.password, 10).then((hash) => {
    user.password = hash;
    prisma.users
      .create({ data: { ...user } })
      .then(() => {
        login(req, res, next);
      })
      .catch((err) => {
        console.log("creation", err);
        Error(res, 500, err);
      });
  });
};

export const update = (req, res, next) => {
  const user = req.body;
  const userId = parseInt(req.params.id);

  prisma.users
    .update({
      where: { id: userId },
      data: { ...user },
    })
    .then(() => {
      res.status(200).json({ message: "Utilisateur update" });
    })
    .catch((err) => {
      console.log("update", err);
      Error(res, 500, err);
    });
};

export const updatePassword = (req, res, next) => {
  const password = req.body.password;
  const userId = parseInt(req.params.id);

  bcrypt.hash(password, 10).then((hash) => {
    prisma.users
      .update({ where: { id: userId }, data: { password: hash } })
      .then(() => {
        res.status(200).json({ message: "password update" });
      })
      .catch((err) => {
        console.log("update", err);
        Error(res, 500, err);
      });
  });
};

export const deleteUser = (req, res, next) => {
  prisma.users
    .delete({ where: { id: req.params.id } })
    .then(() => {
      res.status(200).json({ message: "Utilisateur supprimé" });
    })
    .catch((err) => {
      console.log("suppresion", err);
      Error(res, 500, err);
    });
};

export const fetchAll = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const token = headers[1];
  const tokenDecoded = jwt.verify(token, process.env.CRYPT_KEY);

  const selectedFields = tokenDecoded.isAdmin
    ? {
        id: true,
        username: true,
        nom: true,
        prenom: true,
        mail: true,
        isAdmin: true,
        isBannished: true,
        isValidated: true,
        isSalesman: true,
      }
    : {
        username: true,
        nom: true,
        prenom: true,
        isBannished: true,
        isSalesman: true,
      };

  prisma.users
    .findMany({
      select: selectedFields,
      orderBy: [
        {
          mail: "asc",
        },
      ],
    })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });
};

export const fetchOne = async (req, res, next) => {
  const results = await prisma.users
    .findUnique({
      where: {
        id: req.body.from,
      },
      select: {
        nom: true,
        prenom: true,
      },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json(results);
};

export const fetchAllSalesman = (req, res, next) => {
  prisma.users
    .findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
      },
      where: {
        isSalesman: true,
        isBannished: false,
      },
      orderBy: [
        {
          mail: "asc",
        },
      ],
    })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });
};

export const validateToken = (req, res, next) => {
  const token = req.body.token;
  try {
    const tokenDecoded = jwt.verify(token, process.env.CRYPT_KEY);

    if (tokenDecoded.username) {
      prisma.users
        .findUnique({ where: { username: tokenDecoded.username } })
        .then((results) => {
          res.status(200).json({
            isConnected: true,
            id: results.id,
            username: results.username,
            mail: results.mail,
            Nom: results.nom,
            Prenom: results.prenom,
            isAdmin: results.isAdmin,
            isValidated: results.isValidated,
            isBannished: results.isBannished,
            isSalesman: results.isSalesman,
          });
        })
        .catch(() => {
          res.status(403).json({ isConnected: false });
        });
    }
  } catch {
    res.status(403).json({ isConnected: false });
  }
};

export const validateMail = (req, res, next) => {
  sgmail.setApiKey(process.env.SG_API_KEY);
  const user = req.body;

  const token = jwt.sign(
    {
      id: user.id,
    },
    "TOKEN_FOR_MAIL",
    { expiresIn: 5 * 60 }
  );

  const mailData = {
    to: user.mail, // list of receivers
    from: "Doug <apes.doug@gmail.com>", // sender address
    subject: "Confirmation du mail",
    html: sendConfirmMail(
      "http://localhost:5000/users/mailConfirm/" + token + "&&&" + user.id
    ),
  };

  sgmail
    .send(mailData)
    .then(() => {
      console.log("mail envoyé");
      res.status(200).json({ message: "mail de confirm envoyé" });
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};

export const mailConfirm = (req, res, next) => {
  const params = req.params.id.split("&&&");
  const token = params[0];
  const tokenDecoded = jwt.verify(token, "TOKEN_FOR_MAIL");
  const userId = params[1];

  if (tokenDecoded.id === parseInt(userId)) {
    prisma.users
      .update({
        where: { id: parseInt(userId) },
        data: {
          isValidated: true,
        },
      })
      .then(() => {
        res.redirect(`http://localhost:3001?mailValid=good`);
      });
  } else {
    res.redirect(`http://localhost:3001?mailValid=bad`);
  }
};

export default {
  login,
  createUser,
  validateToken,
  fetchAll,
  deleteUser,
  update,
};
