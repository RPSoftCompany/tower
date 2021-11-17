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

let customFunctions = null;

try {
    customFunctions = require('./extensions/customFunctions.js');
} catch (_e) {
    // ignore
}

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
        this.text = text.replace('\r\n', '\n');

        this.variables = variables;

        this.returnsJson = returnsJson;

        this.configurationVariables = configuration.variables;
        this.configuration = configuration;

        this.textToChange = '';
    }

    /**
     * stringify
     *
     * @param {string} value value to change to JSON compatible string
     *
     * @return {string} JSON compatible string
     */
    stringify(value) {
        const val = JSON.stringify(value);
        return val.substring(1, val.length - 1);
    }

    /**
     * Checks if line represents if end
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents end of if statement, false otherwise
     */
    checkIfIfEnd(line) {
        return /^\s*%%if\s+END\s*%%\s*$/.test(line);
    }

    /**
     * Checks if line represents for end
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents end of for statement, false otherwise
     */
    checkIfForEnd(line) {
        return /%%forEach\s+END\s*%%/.test(line);
    }

    /**
     * Checks if line represents if start
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents if statement, false otherwise
     */
    checkIfIfStart(line) {
        return /^\s*%%if\s+([^END])+%%/.test(line);
    }

    /**
     * Checks if line represents for start
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents for statement, false otherwise
     */
    checkIfForStart(line) {
        return /%%forEach.*%%/.test(line);
    }

    /**
     * Checks if line represents else
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents else statement, false otherwise
     */
    checkIfElse(line) {
        return /%%ELSE%%/.test(line);
    }

    /**
     * Checks if line represents def (create variable)
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents end of if statement, false otherwise
     */
    checkIfDef(line) {
        return /%%def\s+\S+%%/.test(line);
    }

    /**
     * Handle multi object lines
     *
     * @param {string} line line to check
     *
     * @return {string} line normalized line
     */
    handler(line) {
        // replace know values
        if (line.split('%%').length >= 2) {
            Object.keys(this.configuration).forEach( (el, key) => {
                if (el !== 'variables') {
                    if (line.includes(`%%${el}%%`) === true) {
                        const value = this.returnsJson === true ? this.stringify(this.configuration[el])
                            : this.configuration[el];
                        line = line.replace(`%%${el}%%`, value);
                    }
                }
            });
            this.variables.forEach((el) => {
                let regex = new RegExp(`%%${el.varName}[.](name|value|type)+%%`);
                if (regex.test(line) === true) {
                    regex = new RegExp(`%%${el.varName}[.]name%%`);
                    if (regex.test(line) === true) {
                        const toChange = regex.exec(line)[0];
                        const name = this.returnsJson === true ? this.stringify(el.name) : el.name;
                        line = line.replaceAll(toChange, name);
                    }
                    regex = new RegExp(`%%${el.varName}[.]value%%`);
                    if (regex.test(line) === true) {
                        const toChange = regex.exec(line)[0];
                        const value = this.returnsJson === true ?
                            this.stringify(el.value) : el.value;
                        line = line.replaceAll(toChange, value);
                    }
                    regex = new RegExp(`%%${el.varName}[.]type%%`);
                    if (regex.test(line) === true) {
                        const toChange = regex.exec(line)[0];
                        line = line.replaceAll(toChange, el.type);
                    }
                }
            });
        }

        while (line.split('%%').length >= 2) {
            const tempLine = line.substring(line.indexOf('%%') + 2, line.lastIndexOf('%%'));
            const newLine = this.handler(tempLine);
            line = line.replace(`%%${tempLine}%%`, newLine);
        }

        line = this.handleVariableReplace(line);
        return line;
    }

    /**
     * Handle variable replace
     *
     * @param {string} line line to change
     *
     * @return {string} line with changed variables
     */
    handleVariableReplace(line) {
        // function
        const tempText = line.trim();

        if (tempText.startsWith('tower_')) {
            const methodName = tempText.substring(0, tempText.indexOf('('));
            const params = tempText.substring(tempText.indexOf('(') + 1, tempText.lastIndexOf(')'));

            return this.executeMethod(methodName, params);
        } else if (tempText.startsWith('variables') === true) {
            let variable = tempText.substring(tempText.indexOf('[')+1, tempText.length - 1);
            variable = variable.trim();
            if (variable.startsWith('"') || variable.startsWith(`'`) || variable.startsWith('`')) {
                variable = variable.substring(1, variable.length-1);
            }
            let find = this.variables.find((el) => {
                return el.varName === variable;
            });

            if (find) {
                return find.value;
            } else {
                find = this.configurationVariables.find((el) => {
                    return el.name === variable;
                });

                if (find) {
                    return find.value;
                }
            }
        } else if (tempText.split('.').length === 2) {
            const splitLine = tempText.split('.');
            let find = this.variables.find((el) => {
                return el.varName === splitLine[0];
            });

            if (find) {
                return find[splitLine[1]];
            } else {
                find = this.configurationVariables.find((el) => {
                    return el.name === splitLine[0];
                });

                if (find) {
                    return find[splitLine[1]];
                }
            }
        } else if (tempText !== 'variables' && this.configuration.variables[tempText]) {
            return this.configuration.variables[tempText];
        }

        return line;
    }

    /**
     * Handles if
     *
     * @param {int} i iterator, where iterpreter stopped
     * @param {[string]} textLines lines array
     *
     * @return {object} returns updated i and text to change
     */
    handleIf(i, textLines) {
        const currentLine = textLines[i];
        let ifPassed = false;

        if (/\s*%%if\s+\S+[.](name|type|value)+\s+(==|!=|~=|>|<|>=|<=)\s+['"`]+[^'"`]+['"`]+\s*%%/.test(currentLine)) {
            let line = currentLine.replace(/\s*%%if/, '').trim();
            const variableName = line.substring(0, line.indexOf('.'));
            line = line.substring(line.indexOf('.') + 1, line.length);
            const mod = /^\S+/.exec(line)[0];
            let operation = currentLine.replace(/\s*%%if\s+\S+[.](name|type|value)+\s+/, '');
            operation = /^\S+/.exec(operation)[0];
            let compare = currentLine.replace(/\s*%%if\s+\S+[.](name|type|value)+\s+(==|!=|~=|>|<|>=|<=)\s+['"`]+/,
                '');
            compare = /[^'"`]+/.exec(compare)[0];

            const find = this.variables.find( (el) => {
                return el.varName === variableName;
            });

            if (find) {
                if (operation === '==') {
                    if (find[mod] == compare) {
                        ifPassed = true;
                    }
                } else if (operation === '!=') {
                    if (find[mod] != compare) {
                        ifPassed = true;
                    }
                } else if (operation === '>') {
                    if (find[mod] > compare) {
                        ifPassed = true;
                    }
                } else if (operation === '<') {
                    if (find[mod] < compare) {
                        ifPassed = true;
                    }
                } else if (operation === '>=') {
                    if (find[mod] >= compare) {
                        ifPassed = true;
                    }
                } else if (operation === '<=') {
                    if (find[mod] <= compare) {
                        ifPassed = true;
                    }
                } else if (operation === '>~=') {
                    const compareRegEx = new RegExp(compare);
                    if (compareRegEx.test(find[mod]) === true) {
                        ifPassed = true;
                    }
                }

                // handle if statement
                i++;
                const definedVariables = [];
                let whileLine = textLines[i];
                let textChange = '';
                let elseIfs = 0;

                while (whileLine && this.checkIfIfEnd(whileLine) === false || elseIfs > 0 ) {
                    let inElse = false;
                    if (this.checkIfElse(whileLine) === true) {
                        ifPassed = !ifPassed;
                        inElse = true;
                    }

                    if (ifPassed === true && inElse === false) {
                        if (this.checkIfForStart(whileLine) === true) {
                            const value = this.handleFor(i, textLines);
                            i = value.i;
                            textChange += value.text;
                        } else if (this.checkIfIfStart(whileLine) === true) {
                            const value = this.handleIf(i, textLines);
                            i = value.i;
                            textChange += value.text;
                        } else if (this.checkIfDef(whileLine) === true) {
                            const newVariable = this.handleDef(whileLine);
                            definedVariables.push(newVariable);
                            const findVariable = this.variables.find( (el) => {
                                return el.name === newVariable.name;
                            });

                            if (findVariable) {
                                this.variables = this.variables.map( (el) => {
                                    if (el.varName === newVariable.varName) {
                                        el.value = newVariable.value;
                                        el.type = newVariable.type;
                                    }
                                    return el;
                                });
                            } else {
                                this.variables.push(newVariable);
                            }
                        } else {
                            textChange += this.handler(whileLine);
                            textChange += '\n';
                        }
                    } else if (ifPassed === false) {
                        if (this.checkIfIfStart(whileLine)) {
                            elseIfs++;
                        } else if (this.checkIfIfEnd(whileLine)) {
                            elseIfs--;
                        }
                    }

                    i++;
                    whileLine = textLines[i];
                }

                definedVariables.forEach( (variable) => {
                    this.variables = this.variables.filter( (el) => {
                        return el.varName !== variable.varName;
                    });
                });

                return {
                    i: i,
                    text: textChange,
                };
            } else {
                throw new Error(`Invalid variable name in if statement: ${variableName}`);
            }
        } else {
            throw new Error(`Invalid if statement: ${currentLine}`);
        }
    }

    /**
     * Handles for
     *
     * @param {int} i iterator, where iterpreter stopped
     * @param {[string]} textLines lines array
     *
     * @return {object} returns updated i and text to change
     */
    handleFor(i, textLines) {
        const currentLine = textLines[i];
        let varName = '';
        const variable = [];
        const definedVariables = [];

        // check forEach kind
        if (/^\s*%%forEach\s+\S+\s+in\s+list\s*\[/.test(currentLine)) {
            let line = currentLine.replace(/^\s*%%forEach\s+/, '').trim();
            varName = /^\S+/.exec(line)[0];
            line = currentLine.replace(/^\s*%%forEach\s+\S+\s+in\s+list\[\s*/, '');
            let variableName = '';
            if (/^['"`]+/.test(line)) {
                variableName = /^['"`]+[^'`"]+/.exec(line)[0];
                variableName = variableName.substring(1);
            } else {
                variableName = /^[^\]]+/.exec(line)[0];
            }

            let tempVariable = this.configuration.variables.find((el) => {
                return el.name === variableName;
            });

            if (!tempVariable) {
                tempVariable = this.variables.find( (el) => {
                    return el.varName === variableName;
                });
            }

            if (tempVariable) {
                tempVariable.value.forEach((el) => {
                    variable.push({
                        name: el.name,
                        varName: varName,
                        value: el,
                        type: 'string',
                    });
                });
            }
        } else if (/^\s*%%forEach\s+\S+\s+in\s+variables\s*%%/.test(currentLine)) {
            const line = currentLine.replace(/^\s*%%forEach\s+/, '').trim();
            varName = /^\S+/.exec(line)[0];

            this.configuration.variables.forEach((el) => {
                variable.push({
                    name: el.name,
                    varName: varName,
                    value: el.value,
                    type: el.type,
                });
            });
        } else if (/^\s*%%forEach\s+\S+\s+of\s+variables/.test(currentLine)) {
            let line = currentLine.replace(/^\s*%%forEach\s+/, '').trim();
            varName = /^\S+/.exec(line)[0];

            line = line.replace(/^\S+\s+of\s+variables\[['"`]/, '');
            line = line.replace(/['"`]\]\s*%%/, '');

            const reg = new RegExp(line);

            this.configuration.variables.forEach( (el) => {
                if (reg.test(el.name)) {
                    variable.push({
                        name: el.name,
                        varName: varName,
                        value: el.value,
                        type: el.type,
                    });
                }
            });
        } else {
            throw new Error(`Invalid for statement: ${currentLine}`);
        }

        // handle loop
        let maxI = i + 1;
        let changedText = '';
        let wasAnythingAdded = false;

        if (variable.length > 0) {
            for (let loop = 0; loop < variable.length; loop++) {
                let loopLine = textLines[i+1];
                maxI = i + 1;
                let changedVariableLine = '';

                while (loopLine && !this.checkIfForEnd(loopLine)) {
                    this.variables.push({
                        name: variable[loop].name,
                        varName: varName,
                        value: variable[loop].value,
                        type: variable[loop].type,
                    });

                    if (this.checkIfForStart(loopLine) === true) {
                        const innerLoop = this.handleFor(maxI, textLines);
                        maxI = innerLoop.i;
                        changedVariableLine += innerLoop.text;
                    } else if (this.checkIfDef(loopLine) === true) {
                        const newVariable = this.handleDef(loopLine);
                        definedVariables.push(newVariable);
                        const findVariable = this.variables.find( (el) => {
                            return el.name === newVariable.name;
                        });

                        if (findVariable) {
                            this.variables = this.variables.map( (el) => {
                                if (el.varName === newVariable.varName) {
                                    el.value = newVariable.value;
                                    el.type = newVariable.type;
                                }
                                return el;
                            });
                        } else {
                            this.variables.push(newVariable);
                        }
                    } else if (this.checkIfIfStart(loopLine) === true) {
                        const value = this.handleIf(maxI, textLines);
                        changedVariableLine += value.text;
                        maxI = value.i;
                    } else {
                        changedVariableLine += this.handler(loopLine);
                        changedVariableLine += '\n';
                    }

                    maxI++;
                    loopLine = textLines[maxI];

                    this.variables = this.variables.filter( (el) => {
                        return el.varName !== varName;
                    });
                }

                if (this.returnsJson === true) {
                    if (changedVariableLine.trim()) {
                        changedText += wasAnythingAdded === true ? `,${changedVariableLine}`: changedVariableLine;
                    }
                } else {
                    changedText += changedVariableLine;
                }

                if (changedVariableLine.trim()) {
                    wasAnythingAdded = true;
                }
            }
        } else {
            let loopLine = textLines[i+1];
            maxI = i + 1;
            while (loopLine && !this.checkIfForEnd(loopLine)) {
                maxI++;
                loopLine = textLines[maxI];
            }
        }

        definedVariables.forEach( (el) => {
            this.variables = this.variables.filter((variable) => {
                return variable.varName !== el.varName;
            });
        });

        return {
            i: maxI,
            text: changedText,
        };
    }

    /**
     * Handles def statement
     *
     * @param {string} text def line
     *
     * @return {object} variable
     */
    handleDef(text) {
        let newText = this.replaceVariables(text);

        if (/%%def\s+\S+=\S+\s*%%/.test(newText)) {
            newText = newText.replace(/\s*%%def\s*/, '');
            newText= newText.substring(0, newText.lastIndexOf('%%'));

            const array = newText.split('=');

            return {
                name: array[0],
                varName: array[0],
                type: 'string',
                value: array[1],
            };
        } else {
            throw new Error(`Invalid def statement: ${text}`);
        }
    }

    /**
     * Replaces all variables in given string
     *
     * @param {string} text string to replace data in
     *
     * @return {string} updated string
     */
    replaceVariables(text) {
        let newText = '';

        for (const model in this.configuration) {
            if (model !== 'variables') {
                const regEx = new RegExp(`%%\s*${model}\s*%%`);
                if (regEx.test(text)) {
                    text = text.replace(regEx, this.configuration[model]);
                }
            }
        }

        while (/%%[^%]*\.(name|value|type)%%/.test(text)) {
            let variable = /%%[^%]*\.(name|value|type)%%/.exec(text)[0];

            const index = text.indexOf(variable);
            newText += text.substring(0, index);

            variable = variable.substring(2, variable.length - 2);

            const split = variable.split('.');
            const name = split[0];
            const param = split[1];

            const found = this.variables.find((el) => {
                return el.varName === name;
            });

            let value = '';

            if (found) {
                if (found[param]) {
                    value = found[param];
                }
            }

            newText += value;
            text = text.substring(index + variable.length + 4, text.length);
        }

        newText += text;

        text = newText;
        newText = '';

        while (/%%\s*variables\[[^\]]*]\s*%%/.test(text)) {
            const variable = /%%\s*variables\[[^\]]*]\s*%%/.exec(text)[0];

            const index = text.indexOf(variable);
            newText += text.substring(0, index);

            let name = variable.substring(variable.indexOf('[') + 1, variable.lastIndexOf(']'));
            if (name.startsWith('"')) {
                name = name.substring(1, name.length - 1);
            }

            let value = '';

            const found = this.configurationVariables.find((el) => {
                return el.name === name;
            });

            if (found) {
                value = found.value;
            }

            newText += value;
            text = text.substring(index + variable.length, text.length);
        }

        newText += text;

        if (/%%\s*tower_[^%]+%%/.test(newText)) {
            const exec = /%%tower_[^%]+%%/.exec(text);
            const tempText = exec[0];
            const methodName = /%%tower_[^(]+/.exec(tempText)[0].substring(2);
            const params = tempText.substring(tempText.indexOf('(') + 1, tempText.lastIndexOf(')'));

            const methodOutput = this.executeMethod(methodName, params);

            newText = newText.replace(tempText, methodOutput);
        }

        return newText;
    }

    /**
     * Executes givn method
     *
     * @param {string} method method name
     * @param {string} params method params
     *
     * @return {string} updated string
     */
    executeMethod(method, params) {
        method = method.trim();
        params = params.trim();

        if (method === 'tower_toBase64') {
            const buff = Buffer.from(params);
            return buff.toString('base64');
        } else if (method === 'tower_random') {
            const array = params.split(',');
            if (array.length === 2 ) {
                const min = Math.ceil(array[0]);
                const max = Math.floor(array[1]);
                return `${Math.floor(Math.random() * (max - min)) + min}`;
            } else {
                return `${Math.ceil(Math.random() * 100)}`;
            }
        } else if (method === 'tower_substring') {
            const array = params.split(',');
            if (array.length === 2 || array.length === 3) {
                return array[0].substring(array[1], array[2]);
            } else {
                throw new Error(`tower_substring method needs two of three arguments`);
            }
        } else if (method === 'tower_length') {
            const length = `${params}`.length;
            return `${length}`;
        } else if (method === 'tower_indexOf') {
            const lastIndex = params.lastIndexOf(',');
            if (lastIndex === -1) {
                throw new Error(`tower_indexOf method needs two arguments`);
            } else {
                const text = params.substring(0, lastIndex);
                const index = params.substring(lastIndex + 1, params.length);
                return `${text.trim().indexOf(index.trim())}`;
            }
        } else if (customFunctions) {
            if (customFunctions.customFunctions[method]) {
                return customFunctions.customFunctions[method](params);
            }
        }

        throw new Error(`Invalid method name: '${method}'`);
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
    handle() {
        this.validate();

        const textLines = this.text.split('\n');

        for (let i = 0; i < textLines.length; i++) {
            const line = textLines[i];

            if (line.includes('%%') === false) {
                this.textToChange += line + '\n';
            } else {
                if (this.checkIfForStart(line) === true) {
                    const value = this.handleFor(i, textLines);
                    i = value.i;
                    this.textToChange += value.text;
                } else if (this.checkIfIfStart(line) === true) {
                    const value = this.handleIf(i, textLines);
                    i = value.i;
                    this.textToChange += value.text;
                } else {
                    this.textToChange += this.handler(line);
                    this.textToChange += '\n';
                }
            }
        }

        return this.textToChange;
    }

    /**
     * Validates template
     *
     * @return {boolean} if template is valid
     */
    validate() {
        const textLines = this.text.split('\n');

        let ifSt = 0;
        let forSt = 0;

        for (let i = 0; i < textLines.length; i++) {
            const line = textLines[i];
            if (this.checkIfIfEnd(line)) {
                ifSt--;
            } else if (this.checkIfIfStart(line)) {
                ifSt++;
            } else if (this.checkIfForEnd(line)) {
                forSt--;
            } else if (this.checkIfForStart(line)) {
                forSt++;
            }
        }

        if (ifSt !== 0) {
            throw new Error('If statement not properly ended');
        }
        if (forSt !== 0) {
            throw new Error('For statement not properly ended');
        }

        return ifSt === 0 && forSt === 0;
    }
};
