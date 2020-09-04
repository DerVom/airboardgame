import { nanoid } from "nanoid";
import express from "express";

// Utility functions

const throwError = (message, code = 400) => {
  const errorObject = new Error(message);
  errorObject.statusCode = code;
  throw errorObject;
};

const errorGuard = (func) => (req, res, next) => {
  try {
    return func(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Memory backend for proof of concept
export const memoryBackend = () => {
  const data = {};
  const security = {};

  const getOrCreateBox = (boxId) => {
    if (typeof data[boxId] !== "object") {
      data[boxId] = {};
    }
    return data[boxId];
  };

  return {
    checkSecurity(boxId, id, key) {
      if (!security[boxId]) {
        // Not secured
        if (key) {
          // Set security
          security[boxId] = {};

          if (id) {
            // Id -> it's ressource security
            security[boxId][id] = key;
          } else {
            // No id -> it's box security
            security[boxId]._box = key;
          }
        }
        return true;
      }

      if (id) {
        if (security[boxId][id] === undefined) {
          security[boxId][id] = key;
          return true;
        }
        return security[boxId][id] === key;
      } else {
        return (
          security[boxId]._box !== undefined && security[boxId]._box === id
        );
      }
    },
    get(boxId, id) {
      if (data[boxId] === undefined) {
        return [];
      }
      if (id) {
        return data[boxId][id];
      }
      return Object.values(data[boxId]);
    },
    create(boxId, data) {
      const newRessource = { ...data, _id: nanoid(), _createdOn: new Date() };
      getOrCreateBox(boxId)[newRessource._id] = newRessource;
      return newRessource;
    },
    update(boxId, id, body) {
      console.log(boxId, id, body);
      // To prevent created modification
      if (!data[boxId]) {
        throwError("Box not found", 404);
      }
      if (!data[boxId][id]) {
        throwError("Ressource not found", 404);
      }
      const { created } = data[boxId][id];
      const updatedItem = {
        ...data[boxId][id],
        ...body,
        _id: id,
        created,
        _updatedOn: new Date(),
      };
      data[boxId][id] = updatedItem;
      return updatedItem;
    },
    delete(boxId, id) {
      if (data[boxId][id] !== undefined) {
        delete data[boxId][id];
        return 1;
      }
      return 0;
    },
  };
};

// Store Middleware
export const store = (prefix = "/store", backend = memoryBackend()) => {
  const router = express.Router();
  // Object list
  router.get(
    `${prefix}/:boxId/`,
    errorGuard((req, res) => {
      const { boxId } = req.params;
      /*const { readWrite, write } = req.query;
      if (!backend.checkSecurity(boxId, null, readWrite, write)) {
        throwError("You need read access for this box", 403);
      }*/
      const result = backend.get(boxId);
      return res.json(result);
    })
  );

  // One object
  router.get(
    `${prefix}/:boxId/:id`,
    errorGuard((req, res) => {
      const { boxId, id } = req.params;
      /*const { readWrite, write } = req.query;
      if (!backend.checkSecurity(boxId, id, readWrite, write)) {
        throwError("You need read access for this ressource", 403);
      }*/
      const result = backend.get(boxId, id);
      if (result === undefined) {
        throwError("Box or ressource not found", 404);
      }
      return res.json(result);
    })
  );

  // Create object
  router.post(
    `${prefix}/:boxId/`,
    errorGuard((req, res) => {
      console.log(req.body);
      const { boxId } = req.params;
      /*const { key } = req.query;
      if (!backend.checkSecurity(boxId, null, key)) {
        throwError("You need write access for this box", 403);
      }*/
      const result = backend.create(boxId, req.body);
      return res.json(result);
    })
  );

  // Update object
  router.put(
    `${prefix}/:boxId/:id`,
    errorGuard((req, res) => {
      const { boxId, id } = req.params;
      const { key } = req.query;
      if (!backend.checkSecurity(boxId, id, key)) {
        throwError("You need write access for this ressource", 403);
      }
      const result = backend.update(boxId, id, req.body);
      return res.json(result);
    })
  );

  // Delete object
  router.delete(
    `${prefix}/:boxId/:id`,
    errorGuard((req, res) => {
      const { boxId, id } = req.params;
      const { key } = req.query;
      if (!backend.checkSecurity(boxId, id, key)) {
        throwError("You need write access for this ressource", 403);
      }
      const result = backend.delete(boxId, id);
      if (result === 1) {
        res.json({ message: "Deleted" });
      }
      throwError("Box or ressource not found", 404);
    })
  );

  // Middleware to handle errors
  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, _next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message });
  });

  return router;
};

export default store;