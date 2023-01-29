import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { errorManagement as Error } from "../security_public/error.js";

const getKeyRelation = (reqUserId, friendId) =>
  parseInt(reqUserId) < parseInt(friendId)
    ? `${reqUserId}-${friendId}`
    : `${friendId}-${reqUserId}`;

export const fetchAll = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];

  const users = await prisma.users
    .findMany({
      where: { NOT: { id: parseInt(reqUserId) } },
    })
    .catch((err) => {
      console.log(err);
    });
  const friends = await prisma.friends.findMany().catch((err) => {
    console.log(err);
  });

  try {
    users.forEach((user, index) => {
      const friendsRep = [...friends];
      const keyRelation = getKeyRelation(reqUserId, user.id);

      const { mail, password, isAdmin, isValidated, ...userRes } = users[index];
      users[index] = { ...userRes };

      if (
        friendsRep.filter((friend) => friend.relation === keyRelation).length >
        0
      ) {
        if (
          friendsRep.filter((friend) => friend.relation === keyRelation)[0]
            .requesting
        ) {
          if (
            parseInt(
              friendsRep.filter((friend) => friend.relation === keyRelation)[0]
                .requesting
            ) !== parseInt(reqUserId)
          ) {
            users[index] = { ...userRes, isRequesting: true };
          } else {
            users[index] = { ...userRes, isAsking: true };
          }
        } else {
          users[index] = { ...userRes, isFriend: true };
        }
      }
    });

    res.status(200).json(users);
  } catch (err) {
    Error(res, 500, err);
  }
};

export const requestFriend = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];

  const friendId = req.body.friendId;

  const keyRelation = getKeyRelation(reqUserId, friendId);

  prisma.friends
    .upsert({
      where: { relation: keyRelation },
      update: {},
      create: { relation: keyRelation, requesting: parseInt(reqUserId) },
    })
    .then(() => {
      fetchAll(req, res, next);
    });
};

export const confirmFriend = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];

  const friendId = req.body.friendId;

  const keyRelation = getKeyRelation(reqUserId, friendId);

  prisma.friends
    .update({
      where: { relation: keyRelation },
      data: { requesting: null },
    })
    .then(() => {
      fetchAll(req, res, next);
    });
};

export const removeFriend = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];

  const friendId = req.params.id;

  const keyRelation = getKeyRelation(reqUserId, friendId);

  prisma.friends
    .delete({
      where: { relation: keyRelation },
    })
    .then(() => {
      fetchAll(req, res, next);
    });
};
