import { Conversation } from "../Mongo/Conversations.js";
import { errorManagement as Error } from "../security_public/error.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const fetchAllReports = (req, res, next) => {
  Conversation.find({
    "messages.reports.0": { $exists: true },
    "messages.reports.treated": false,
  })
    .then((conversations) => {
      const reports = [];

      conversations.map((conversation) => {
        const messages = conversation.messages.filter(
          (message) => message.reports.length > 0
        );

        messages.map((message) => {
          const reportsMap = message.reports.filter(
            (report) => !report.treated
          );
          reportsMap.map((report) => {
            reports.push({
              _id: report._id,
              userReporting: report.from,
              userReported: message.owner,
              message: message.message,
              justification: report.justification,
            });
          });
        });
      });

      res.status(200).json({
        reports: reports,
      });
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });
};

export const treatedReport = (req, res, next) => {
  const reportId = req.body.reportId;

  Conversation.findOneAndUpdate(
    { "messages.reports._id": reportId },
    {
      $set: {
        "messages.$[inner].reports.$[second].treated": true,
      },
    },
    {
      arrayFilters: [
        { "inner.reports._id": reportId },
        { "second._id": reportId },
      ],
    }
  )
    .then(() => {
      fetchAllReports(req, res, next);
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });
};

export const bannishUser = (req, res, next) => {
  const userId = req.body.userId;

  prisma.users
    .update({ where: { id: userId }, data: { isBannished: true } })
    .then(() => {
      Conversation.updateMany(
        { "messages.owner": userId, "messages.reports.from": { $ne: userId } },
        {
          $set: {
            "messages.$[inner].reports.$[second].treated": true,
          },
        },
        {
          arrayFilters: [
            { "inner.owner": userId },
            { "second.from": { $ne: userId } },
          ],
        }
      )
        .then(() => {
          fetchAllReports(req, res, next);
        })
        .catch((err) => {
          console.log(err);
          Error(res, 500, err);
        });
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });
};
