import { PrismaClient } from "@prisma/client";
import { errorManagement as Error } from "../security_public/error.js";

const prisma = new PrismaClient();

export const requestConv = async (req, res, next) => {
  console.log(req.body);
  await prisma.conv_request
    .create({
      data: { ...req.body, state: "requested" },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json({ message: "Requested" });
};

export const fetchRequest = async (req, res, next) => {
  const results = await prisma.conv_request
    .findFirst({
      where: { from: req.body.from, state: { in: ["requested", "accepted"] } },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json(results);
};

export const resolveConv = async (req, res, next) => {
  await prisma.conv_request
    .update({
      where: { id: req.body.id },
      data: { state: "resolved" },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json({ message: "resolved" });
};

export const fetchAllRequests = async (req, res, next) => {
  const results = await prisma.conv_request
    .findMany({
      where: {
        for: req.body.for,
        state: { in: ["requested", "accepted"] },
        NOT: {},
      },
      include: {
        users_conv_request_fromTousers: { select: { nom: true, prenom: true } },
      },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json(results);
};

export const updateRequestState = async (req, res, next) => {
  await prisma.conv_request
    .update({
      where: { id: req.body.id },
      data: { state: req.body.state },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json({ message: "updated" });
};
