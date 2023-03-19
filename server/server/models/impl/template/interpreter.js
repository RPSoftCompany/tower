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

let customFunctions = null;

try {
  customFunctions = require("./extensions/customFunctions.js");
} catch (_e) {
  // ignore
}

const { Liquid } = require("liquidjs");

/**
 * Common class for interpreter
 */
class InterpreterCommon {
  /**
   * Constructor
   *
   * @param {string} text text to handle
   * @param {object} configuration full configuration object
   * @param {boolean} returnsJson Indicates if returned data is json
   * @param {[object]} variables process variables array
   *
   */
  constructor(text, configuration, returnsJson, variables) {
    this.variables = [];
    this.text = text.replace("\r\n", "\n");

    this.variables = variables;

    this.returnsJson = returnsJson;

    this.globalVariables = [];

    this.configurationVariables = configuration.variables;
    this.configuration = configuration;

    this.textToChange = "";
  }
}

module.exports = class Interpreter extends InterpreterCommon {
  /**
   * Constructor
   *
   * @param {string} text text to handle
   * @param {object} configuration full configuration object
   * @param {boolean} returnsJson Indicates if returned data is json
   * @param {[object]} variables process variables array
   *
   */
  constructor(text, configuration, returnsJson, variables) {
    super(text, configuration, returnsJson, variables);
  }

  /**
   * Interprets the template string and creates the output template
   *
   * @return {string} filled template
   */
  async handle() {
    const engine = new Liquid();

    engine.registerFilter("tower_toBase64", this.towerToBase64);
    engine.registerFilter("tower_random", this.towerRandom);
    engine.registerFilter("tower_toString", this.towerToString);
    engine.registerFilter(
      "tower_getVariableByName",
      this.towerGetVariableByName
    );

    if (customFunctions) {
      Object.keys(customFunctions).forEach((func) => {
        engine.registerFilter(func, customFunctions[func]);
      });
    }

    this.text = await engine.parseAndRender(this.text, this.configuration);

    return this.text;
  }

  /**
   * towerToBase64
   *
   * @param {string} str string to encode
   * @return {string} string in Base64
   */
  towerToBase64(str) {
    const buff = Buffer.from(str);
    return buff.toString("base64");
  }

  /**
   * towerRandom
   *
   * @param {number} from minimum value of the generated number
   * @param {number} to maximum value of the generated number
   *
   * @return {number} random number
   */
  towerRandom(from, to) {
    if (from && to) {
      const min = Math.ceil(from);
      const max = Math.floor(to);
      return Math.floor(Math.random() * (max - min)) + min;
    } else {
      return Math.ceil(Math.random() * 100);
    }
  }

  /**
   * towerToString
   *
   * @param {any} str any value
   * @return {string} value as string
   */
  towerToString(str) {
    return `${str}`;
  }

  /**
   * towerGetVariableByName
   *
   * @param {Array} variables
   * @param {string} name
   * @return {*|null}
   */
  towerGetVariableByName(variables, name) {
    const found = variables.find((el) => {
      return el.name === name;
    });

    if (found) {
      return found;
    } else {
      return null;
    }
  }
};
