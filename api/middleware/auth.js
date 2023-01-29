import jwt from "jsonwebtoken";

import { errorManagement } from "../security_public/error.js";

export const auth = (req, res, next) => {
  try {
    const headers = req.headers.authorization.split(" ");
    const token = headers[1];
    const tokenDecoded = jwt.verify(token, process.env.CRYPT_KEY);
    const id = tokenDecoded.id;
    if (headers[2] && headers[2] === id.toString()) {
      next();
    } else {
      throw "invalid user";
    }
  } catch {
    errorManagement(res, 401, { message: "Invalid request" });
  }
};

export const authAdmin = (req, res, next) => {
  try {
    const headers = req.headers.authorization.split(" ");
    const token = headers[1];
    const tokenDecoded = jwt.verify(token, process.env.CRYPT_KEY);
    const id = tokenDecoded.id;
    const isAdmin = tokenDecoded.isAdmin;
    if (headers[2] && headers[2] === id.toString() && isAdmin) {
      next();
    } else {
      throw "invalid user";
    }
  } catch {
    errorManagement(res, 401, { message: "Invalid request" });
  }
};

export default { auth, authAdmin };
