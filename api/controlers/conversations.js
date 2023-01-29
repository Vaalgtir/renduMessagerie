import mongoose from "mongoose";
import { Conversation } from "../Mongo/Conversations.js";

import { errorManagement as Error } from "../security_public/error.js";

export const fetchAll = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];

  Conversation.find({ owners: reqUserId })
    .sort({ updatedAt: -1 })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};

export const create = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];
  const friendId = req.body.friendId;

  const owners = [reqUserId, friendId].sort();

  Conversation.findOne({ owners }).then((oldConv) => {
    if (!oldConv) {
      const conversation = new Conversation({
        owners,
        messages: [],
      });

      conversation
        .save()
        .then(() => {
          fetchAll(req, res, next);
        })
        .catch((err) => {
          Error(res, 500, err);
        });
    } else {
      res.status(200).json({ message: "Conversation already created" });
    }
  });
};

export const addMessage = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];
  const owners = req.body.owners;
  const message = req.body.message;

  if (message && message.length > 0) {
    Conversation.findOneAndUpdate(
      { owners },
      {
        $push: {
          messages: {
            owner: reqUserId,
            message,
          },
        },
      }
    )
      .then((results) => {
        res.status(200).json({
          message: "Message sent",
          _id: results.messages[results.messages.length - 1]._id,
        });
      })
      .catch((err) => {
        Error(res, 500, err);
      });
  } else {
    Error(res, 500, { message: "Message is required" });
  }
};

export const reportMessage = (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const reqUserId = headers[2];
  const { messageId, justification } = req.body;
  console.log("here", messageId);

  Conversation.findOneAndUpdate(
    { "messages._id": messageId },
    {
      $push: {
        "messages.$.reports": { justification, from: reqUserId },
      },
    }
  )
    .then(() => {
      res.status(200).json({
        message: "Message reported",
      });
    })
    .catch((err) => {
      // console.log(err);
      Error(res, 500, err);
    });
};
