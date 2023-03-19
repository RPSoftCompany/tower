/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

"use strict";

const ConnectionModel = require("./impl/connection");

let connection = null;

const initiate = (main) => {
  if (main.app !== undefined && main.app.booted) {
    connection = new ConnectionModel(main.app);
  } else {
    setTimeout(() => {
      initiate(main);
    }, 200);
  }
};

module.exports = (Connection) => {
  initiate(Connection);

  Connection.afterRemote("*", (context, unused, next) => {
    const audit = Connection.app.get("AuditInstance");
    audit.logAudit(context, "Connection");
    next();
  });

  Connection.afterRemoteError("*", (context, next) => {
    const audit = Connection.app.get("AuditInstance");
    audit.logError(context, "Connection");
    next();
  });

  Connection.disableRemoteMethodByName("create"); // POST
  Connection.disableRemoteMethodByName("find"); // GET
  Connection.disableRemoteMethodByName("upsert"); // PATCH
  Connection.disableRemoteMethodByName("replaceOrCreate"); // PUT

  Connection.disableRemoteMethodByName("findById");

  Connection.disableRemoteMethodByName("replaceById");
  Connection.disableRemoteMethodByName("deleteById");
  Connection.disableRemoteMethodByName("prototype.updateAttributes");

  Connection.disableRemoteMethodByName("update");
  Connection.disableRemoteMethodByName("upsertWithWhere");

  Connection.disableRemoteMethodByName("count");
  Connection.disableRemoteMethodByName("findOne");

  Connection.disableRemoteMethodByName("createChangeStream");

  Connection.testConnection = async (type, body) => {
    return await connection.testConnection(type, body);
  };

  Connection.createConnection = async (conn) => {
    return await connection.saveConnection(conn);
  };

  Connection.patchConnection = async (conn) => {
    return await connection.saveConnection(conn);
  };

  Connection.findConnection = async (filter) => {
    return await connection.findConnection(filter);
  };

  Connection.findSCPConnectionsAndCopy = async (conn) => {
    return await connection.findSCPConnectionsAndCopy(conn);
  };

  Connection.deleteConnection = async (id) => {
    return await connection.deleteConnection(id);
  };

  // ====================================================
  // ================ Remote methods ====================
  // ====================================================

  Connection.remoteMethod("patchConnection", {
    http: { verb: "PATCH", status: 200, path: "/" },
    accepts: [
      { arg: "connection", type: "connection", http: { source: "body" } },
    ],
    description:
      "Patch an existing model instance or insert a new one into the data source.",
    returns: { arg: "model", type: "connection", root: true },
  });

  Connection.remoteMethod("findConnection", {
    http: { verb: "GET", status: 200, path: "/" },
    accepts: [{ arg: "filter", type: "string", http: { source: "query" } }],
    description:
      "Find all instances of the model matched by filter from the data source.",
    returns: { arg: "model", type: "connection", root: true },
  });

  Connection.remoteMethod("deleteConnection", {
    http: { verb: "DELETE", status: 204, path: "/:id" },
    accepts: [{ arg: "id", type: "string", http: { source: "path" } }],
    description: "Delete a model instance by {{id}} from the data source.",
  });

  Connection.remoteMethod("testConnection", {
    http: { verb: "POST", status: 200, path: "/testConnection" },
    accepts: [
      { arg: "type", type: "string" },
      { arg: "connection", type: "connection", http: { source: "body" } },
    ],
    description: "Tests given connection based on given connection details.",
    returns: { arg: "ret", type: "boolean", root: true },
  });
};
