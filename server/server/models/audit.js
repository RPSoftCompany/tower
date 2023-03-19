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

const AuditModel = require("./impl/audit.js");
let auditInstance = null;

const initiate = (main) => {
  if (main.app !== undefined && main.app.booted) {
    auditInstance = new AuditModel(main.app);
  } else {
    setTimeout(() => {
      initiate(main);
    }, 200);
  }
};

module.exports = function (Audit) {
  initiate(Audit);

  Audit.disableRemoteMethodByName("upsert");
  Audit.disableRemoteMethodByName("upsertWithWhere");
  Audit.disableRemoteMethodByName("update");
  Audit.disableRemoteMethodByName("replaceOrCreate");
  Audit.disableRemoteMethodByName("create");
  Audit.disableRemoteMethodByName("count");
  Audit.disableRemoteMethodByName("prototype.__get__member");

  Audit.disableRemoteMethodByName("prototype.updateAttributes");
  Audit.disableRemoteMethodByName("findById");
  Audit.disableRemoteMethodByName("exists");
  Audit.disableRemoteMethodByName("replaceById");
  Audit.disableRemoteMethodByName("deleteById");

  Audit.disableRemoteMethodByName("createChangeStream");

  Audit.disableRemoteMethodByName("findOne");
  Audit.disableRemoteMethodByName("find");

  Audit.modified_find = async (filter) => {
    return await auditInstance.find(filter);
  };

  Audit.modified_count = async (filter) => {
    return await auditInstance.count(filter);
  };

  // ====================================================
  // ================ Remote methods ====================
  // ====================================================

  Audit.remoteMethod("modified_find", {
    http: { verb: "GET", status: 200, path: "/" },
    accepts: [{ arg: "filter", type: "object", http: { source: "query" } }],
    description:
      "Find all instances of the model matched by filter from the data source.",
    returns: { arg: "model", type: "audit", root: true },
  });
  Audit.remoteMethod("modified_count", {
    http: { verb: "GET", status: 200, path: "/count" },
    accepts: [{ arg: "filter", type: "object", http: { source: "query" } }],
    description:
      "Find all instances of the model matched by filter from the data source.",
    returns: { arg: "model", type: "Object", root: true },
  });
};
