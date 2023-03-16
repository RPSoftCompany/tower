//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.

"use strict";

const HttpErrors = require("http-errors");

const ConfigModel = require("./impl/configuration.js");

let configModel = null;

const initiate = (main) => {
  if (main.app !== undefined && main.app.booted) {
    if (main.app.dataSources["mongoDB"] === undefined) {
      setTimeout(() => {
        initiate(main);
      }, 200);
    } else {
      if (
        main.app.dataSources["mongoDB"].connected &&
        main.app.nonSafe !== undefined
      ) {
        configModel = new ConfigModel(main.app);
        configModel.autoInitialize();
        hook(main);
      } else {
        setTimeout(() => {
          initiate(main);
        }, 200);
      }
    }
  } else {
    setTimeout(() => {
      initiate(main);
    }, 200);
  }
};

const hook = (main) => {
  if (main.app.hookSingleton !== undefined) {
    main.app.hookSingleton.createHook(
      "beforeCreate",
      "Configuration",
      "description"
    );
    main.app.hookSingleton.createHook(
      "afterCreate",
      "Configuration",
      "description"
    );

    // default variable changed
    main.app.hookSingleton.createHook(
      "afterUpdate",
      "Configuration",
      "description"
    );
  } else {
    setTimeout(() => {
      hook(main);
    }, 200);
  }
};

module.exports = function (Configuration) {
  initiate(Configuration);

  Configuration.afterRemote("*", (context, unused, next) => {
    const audit = Configuration.app.get("AuditInstance");
    audit.logAudit(context, "Configuration");
    next();
  });

  Configuration.afterRemoteError("*", (context, next) => {
    const audit = Configuration.app.get("AuditInstance");
    audit.logError(context, "Configuration");
    next();
  });

  Configuration.disableRemoteMethodByName("create"); // POST
  Configuration.disableRemoteMethodByName("find"); // GET
  Configuration.disableRemoteMethodByName("upsert"); // PATCH
  Configuration.disableRemoteMethodByName("replaceOrCreate"); // PUT

  Configuration.disableRemoteMethodByName("findById");
  Configuration.disableRemoteMethodByName("exists");
  Configuration.disableRemoteMethodByName("replaceById");
  Configuration.disableRemoteMethodByName("deleteById");
  Configuration.disableRemoteMethodByName("prototype.updateAttributes");

  Configuration.disableRemoteMethodByName("update");
  Configuration.disableRemoteMethodByName("upsertWithWhere");

  Configuration.disableRemoteMethodByName("count");
  Configuration.disableRemoteMethodByName("findOne");

  Configuration.disableRemoteMethodByName("createChangeStream");

  Configuration.createConfiguration = async (model, options) => {
    return await configModel.createConfiguration(model, options);
  };

  Configuration.findWithPermissions = async (filter, options) => {
    return await configModel.findWithPermissions(filter, options);
  };

  Configuration.findOneWithPermissions = async (filter, options) => {
    const find = await configModel.findWithPermissions(filter, options);
    if (find.length > 0) {
      return find[0];
    } else {
      return null;
    }
  };

  Configuration.countWithPermissions = async (filter, options) => {
    const count = await configModel.findWithPermissions(filter, options);
    return count.length;
  };

  Configuration.findByIdWithPermissions = async (id, options) => {
    if (id === undefined) {
      id = "";
    }
    const filter = {
      where: {
        id: id,
      },
    };
    return await configModel.findWithPermissions(filter, options);
  };

  Configuration.existsWithPermissions = async (id, options) => {
    if (id === undefined) {
      id = "";
    }
    const filter = {
      where: {
        id: id,
      },
    };

    const exists = await configModel.findWithPermissions(filter, options);

    if (exists.length === 0) {
      throw new HttpErrors.NotFound();
    }

    return true;
  };

  Configuration.existsWithPermissionsJson = async (id, options) => {
    if (id === undefined) {
      id = "";
    }
    const filter = {
      where: {
        id: id,
      },
    };

    const exists = await configModel.findWithPermissions(filter, options);

    if (exists.length === 0) {
      return false;
    }

    return true;
  };

  Configuration.promoteConfiguration = async (id, options) => {
    return await configModel.promoteConfiguration(id, options);
  };

  Configuration.findPromotionCandidates = async (model, options) => {
    return await configModel.findPromotionCandidates(model, options);
  };

  Configuration.initialized = async () => {
    return Configuration.app.secret !== undefined;
  };

  Configuration.initialize = async (secret) => {
    return await configModel.initializeSecret(secret);
  };

  Configuration.findConfigurationForGivenDate = async (
    filter,
    date,
    options
  ) => {
    return await configModel.findConfigurationForGivenDate(
      filter,
      date,
      options
    );
  };

  Configuration.findVariable = async (
    search,
    valueOrName,
    isRegex,
    options
  ) => {
    return await configModel.findVariable(
      search,
      valueOrName,
      isRegex,
      options
    );
  };

  // ====================================================
  // ================ Remote methods ====================
  // ====================================================

  Configuration.remoteMethod("createConfiguration", {
    http: { verb: "POST", status: 200, path: "/" },
    accepts: [
      { arg: "model", type: "configuration", http: { source: "body" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description:
      "Create a new instance of the model and persist it into the data source.",
    returns: { arg: "model", type: "configuration", root: true },
  });

  Configuration.remoteMethod("findWithPermissions", {
    http: { verb: "GET", status: 200, path: "/" },
    accepts: [
      { arg: "filter", type: "object", http: { source: "query" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description:
      "Find all instances of the model matched by filter from the data source.",
    returns: { arg: "model", type: "[configuration]", root: true },
  });

  Configuration.remoteMethod("findByIdWithPermissions", {
    http: { verb: "GET", status: 200, path: "/:id" },
    accepts: [
      { arg: "id", type: "string", http: { source: "path" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Find a model instance by {{id}} from the data source.",
    returns: { arg: "model", type: "[configuration]", root: true },
  });

  Configuration.remoteMethod("existsWithPermissions", {
    http: { verb: "HEAD", status: 200, path: "/:id" },
    accepts: [
      { arg: "id", type: "string", http: { source: "path" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Check whether a model instance exists in the data source.",
  });

  Configuration.remoteMethod("existsWithPermissionsJson", {
    http: { verb: "GET", status: 200, path: "/:id/exists" },
    accepts: [
      { arg: "id", type: "string", http: { source: "path" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Check whether a model instance exists in the data source.",
    returns: { arg: "exists", type: "boolean" },
  });

  Configuration.remoteMethod("countWithPermissions", {
    http: { verb: "GET", status: 200, path: "/count" },
    accepts: [
      { arg: "filter", type: "object", http: { source: "query" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description:
      "Count instances of the model matched by where from the data source.",
    returns: { arg: "count", type: "number" },
  });

  Configuration.remoteMethod("findOneWithPermissions", {
    http: { verb: "GET", status: 200, path: "/findOne" },
    accepts: [
      { arg: "filter", type: "object", http: { source: "query" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description:
      "Find first instance of the model matched by filter from the data source.",
    returns: { arg: "model", type: "configuration", root: true },
  });

  Configuration.remoteMethod("promoteConfiguration", {
    http: { verb: "POST", status: 200, path: "/:id/promote" },
    accepts: [
      { arg: "id", type: "string", http: { source: "path" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Promote configuration",
    returns: { arg: "configuration", type: "configuration", root: true },
  });

  Configuration.remoteMethod("findPromotionCandidates", {
    http: { verb: "POST", status: 200, path: "/promotionCandidates" },
    accepts: [
      { arg: "model", type: "object", http: { source: "body" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Find all promotion candidates for given configuration",
    returns: { arg: "configuration", type: "[configuration]", root: true },
  });

  Configuration.remoteMethod("findConfigurationForGivenDate", {
    http: { verb: "GET", status: 200, path: "/findByDate" },
    accepts: [
      { arg: "filter", type: "any", http: { source: "query" } },
      { arg: "date", type: "string", http: { source: "query" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Find all promotion candidates for given configuration",
    returns: { arg: "configuration", type: "configuration", root: true },
  });

  Configuration.remoteMethod("initialized", {
    http: { verb: "GET", status: 200, path: "/initialized" },
    description:
      "Returns information if Tower was initialized with encryption key",
    returns: { arg: "boolean", type: "boolean", root: true },
  });

  Configuration.remoteMethod("initialize", {
    http: { verb: "POST", status: 204, path: "/initialize" },
    accepts: [{ arg: "secret", type: "string" }],
    description: "Sets Tower's encryption key",
  });

  Configuration.remoteMethod("findVariable", {
    http: { verb: "GET", status: 200, path: "/findVariable" },
    accepts: [
      { arg: "searchText", type: "any", http: { source: "query" } },
      { arg: "valueOrName", type: "boolean", http: { source: "query" } },
      { arg: "isRegex", type: "boolean", http: { source: "query" } },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    description: "Find all configurations with searched variable",
    returns: { arg: "configuration", type: "[configuration]", root: true },
  });
};
