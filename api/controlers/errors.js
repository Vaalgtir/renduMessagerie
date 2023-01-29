import { Error } from "../Mongo/Errors.js";

import { errorManagement as errorManagement } from "../security_public/error.js";

export const fetchAll = (req, res, next) => {
  Error.find()
    .sort({ updatedAt: -1 })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      errorManagement(res, 500, err);
    });
};
