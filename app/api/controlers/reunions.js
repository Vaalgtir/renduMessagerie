import { reunions } from "../Websocket/handlerConnection.js";

export const createReunion = (req, res, next) => {
  if (!reunions.find((reu) => reu.nom === req.body.nom)) {
    reunions.push({ ...req.body, users: 0 });

    res.status(201).json("created");
  } else {
    res.status(403).json("already created");
  }
};

export const updateReunion = (req, res, next) => {
  const { prevNom, ...body } = req.body;
  if (reunions.find((reu) => reu.nom === prevNom)) {
    const index = reunions.findIndex((reu) => reu.nom === prevNom);
    reunions[index] = { ...reunions[index], ...body };

    res.status(201).json("updated");
  } else {
    res.status(403).json("doesnt exist");
  }
};

export const deleteReunion = (req, res, next) => {
  const { room } = req.body;
  if (reunions.find((reu) => reu.nom === room)) {
    const index = reunions.findIndex((reu) => reu.nom === room);
    console.log(index);

    reunions.splice(index, 1);

    res.status(201).json("deleted");
  } else {
    res.status(403).json("doesnt exist");
  }
};

export const getReunions = (req, res, next) => {
  console.log(reunions);
  res.status(201).json(reunions);
};
