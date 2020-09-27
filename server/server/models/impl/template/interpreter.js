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
//    along with Tower.  If not, see <http://www.gnu.org/licenses/>.

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
     * Updates common variables
     *
     * @param {string} line line to update
     *
     * @return {string} updated line
     */
    updateCommons(line) {
        if (line.includes('%%')) {
            if (/%%\s*effectiveDate\s*%%/.test(line)) {
                line = line.replace(
                    /%%\s*effectiveDate\s*%%/,
                    this.configuration.effectiveDate
                );
            }
        }

        return line;
    }

    /**
     * Checks if line represents if end
     *
     * @param {string} line line to check
     *
     * @return {boolean} true if line represents end of if statement, false otherwise
     */
    checkIfIfEnd(line) {
        return /\%\%if\s*END\%\%/.test(line);
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
        return /^.*%%if\s+/.test(line);
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
     * @return {string} true if line represents else statement, false otherwise
     */
    checkIfElse(line) {
        return /%%ELSE%%/.test(line);
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
        const newTextLines = textLines.slice(i, textLines.length);

        const newIf = new If(
            newTextLines.join('\n'),
            this.configuration,
            this.returnsJson,
            this.variables
        );

        const handled = newIf.handle();

        return {
            i: handled.lines,
            text: handled.text,
        };
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
        const newTextLines = textLines.slice(i, textLines.length);

        const newForEach = new ForEach(
            newTextLines.join('\n'),
            this.configuration,
            this.returnsJson,
            this.variables
        );
        const handled = newForEach.handle();

        return handled;
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

        while (/%%[^%]*\.(name|value)%%/.test(text)) {
            let variable = /%%[^%]*\.(name|value)%%/.exec(text)[0];

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

            if (found !== undefined && found !== null) {
                if (found[param] !== undefined) {
                    value = found[param];
                }
            }

            newText += value;
            text = text.substring(index + variable.length + 4, text.length);
        }

        newText += text;

        text = newText;
        newText = '';

        while (/%%\s*variables\[[^\]]*\]\s*%%/.test(text)) {
            const variable = /%%\s*variables\[[^\]]*\]\s*%%/.exec(text)[0];

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

            if (found !== undefined && found !== null) {
                value = found.value;
            }

            newText += value;
            text = text.substring(index + variable.length, text.length);
        }

        newText += text;

        return newText;
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
            let line = textLines[i];
            let addLine = true;

            if (this.checkIfIfEnd(line)) {
                addLine = false;
            } else if (this.checkIfIfStart(line)) {
                addLine = false;
                const handled = this.handleIf(i, textLines);
                i = handled.i + i;
                this.textToChange += handled.text;
            } else if (this.checkIfForEnd(line)) {
                addLine = false;
            } else if (this.checkIfForStart(line)) {
                addLine = false;
                const handled = this.handleFor(i, textLines);
                this.textToChange += handled.text;
                i = handled.lines + i;
            } else if (this.checkIfElse(line)) {
                addLine = false;
            }

            if (addLine) {
                line = this.replaceVariables(line);
                this.textToChange += line + '\n';
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

        if (ifSt != 0) {
            throw new Error('If statement not properly ended');
        }
        if (forSt != 0) {
            throw new Error('For statement not properly ended');
        }

        return ifSt === 0 && forSt === 0;
    }
};

/**
 * Class to interpret if statements
 */
class If extends InterpreterCommon {
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
     * @return {object} processed lines and text
     */
    handle() {
        const textLines = this.text.split('\n');

        let ifResult = false;
        const response = {
            text: '',
            lines: 0,
        };

        if (this.checkIfElse(textLines[0])) {
            ifResult = true;
        } else {
            ifResult = this.getIfData(textLines[0]);
        }

        if (ifResult) {
            let i = 1;
            let inElse = false;
            let ifEnd = false;
            while (!ifEnd && i < textLines.length) {
                let line = textLines[i];
                response.lines++;
                let addLine = true;

                if (this.checkIfIfEnd(line)) {
                    ifEnd = true;
                    addLine = false;
                } else if (this.checkIfElse(line) && !inElse) {
                    addLine = false;
                    inElse = true;
                } else if (this.checkIfForEnd(line) && !inElse) {
                    addLine = false;
                } else if (this.checkIfForStart(line) && !inElse) {
                    addLine = false;
                    const handled = this.handleFor(i, textLines);
                    i = handled.lines + i;
                    response.text += handled.text;
                } else if (this.checkIfIfStart(line) && !inElse) {
                    addLine = false;
                    const handled = this.handleIf(i, textLines);
                    i = handled.i + i;
                    response.text += handled.text;
                }

                if (addLine && !inElse) {
                    line = this.replaceVariables(line);
                    response.text += line + '\n';
                }

                i++;
            }
        } else {
            let i = 1;
            let ifStarted = 1;
            let ifEnd = false;
            while (!ifEnd && i < textLines.length) {
                const line = textLines[i];
                response.lines++;
                if (this.checkIfIfEnd(line)) {
                    ifStarted--;
                    if (ifStarted === 0) {
                        ifEnd = true;
                    }
                } else if (this.checkIfIfStart(line)) {
                    ifStarted++;
                } else if (this.checkIfElse(line)) {
                    if (ifStarted === 1) {
                        const handled = this.handleIf(i, textLines);
                        i = handled.i + i;
                        ifEnd = true;
                    }
                }

                i++;
            }
        }

        return response;
    }

    /**
     * Returs if informations
     *
     * @param {string} text if text
     *
     * @return {boolean} if condition is met
     */
    getIfData(text) {
        // IF validation
        const valid = /^\s*%%if\s+(\S+\[['"`]\S+['"`]\]|\S+\.(name|value)+)\s+[<>=!~]+\s+\S+\s*%%\s*/.test(text);
        if (!valid) {
            throw new Error(`Invalid if statement: ${text}`);
        }

        text = text.replace(/\s*%%if\s*/, '');

        const variable = {
            name: null,
            prop: null,
            standard: false,
        };

        let variables = /variables\[['"`]\S+['"`]\]/.exec(text);
        if (variables !== null) {
            variables = variables[0];
        } else {
            variables = null;
        }

        if (variables === null) {
            const temp = /\S+\.(name|value)+/.exec(text)[0];
            const split = temp.split('.');
            variable.name = split[0];
            variable.prop = split[1];

            text = text.replace(/^\S+\s*[^=!~<>]+/, '');
        } else {
            let temp = text.replace(/variables\[['"`]/, '');
            temp = temp.replace(/['"`].*/, '');

            variable.name = temp;
            variable.standard = true;

            text = text.replace(/^\S+[^\s=!<>~]/, '');
        }

        let varValue = null;

        if (variable.standard) {
            console.log(this.configurationVariables);

            varValue = this.configurationVariables.find((el) => {
                return el.name === variable.name;
            });

            if (varValue !== null && varValue !== undefined) {
                varValue = varValue.value;
            }
        } else {
            varValue = this.variables.find((el) => {
                return el.varName === variable.name;
            });

            if (varValue !== null && varValue !== undefined) {
                varValue = varValue[variable.prop];
            }
        }

        if (varValue === undefined) {
            varValue = null;
        }

        let sign = /\s*[~=!<>]+/.exec(text)[0];
        sign = sign.trim();

        text = text.replace(/\s*[\s=!~<>]+/, '');

        let condition = text.replace(/%%\s*$/, '');
        if (condition.startsWith('"')) {
            condition = condition.substring(1, condition.length - 1);
        }

        console.log(`${varValue == condition}`);

        if (sign === '==') {
            return `${varValue}` == `${condition}`;
        } else if (sign === '>=') {
            return varValue >= condition;
        } else if (sign === '!=') {
            return `${varValue}` != `${condition}`;
        } else if (sign === '<=') {
            return varValue <= condition;
        } else if (sign === '>') {
            return varValue > condition;
        } else if (sign === '<') {
            return varValue < condition;
        } else if (sign === '~=') {
            const regex = new RegExp(condition);
            return regex.test(varValue);
        } else {
            throw new Error(`Invalid sign '${sign}' in if statement`);
        }
    }
}

/**
 * Class to interpret for statements
 */
class ForEach extends InterpreterCommon {
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
     * @return {object} processed lines and text
     */
    handle() {
        const textLines = this.text.split('\n');

        const response = {
            text: '',
            lines: 0,
        };

        const data = this.getForEachData(textLines[0], this.configurationVariables);

        let processedLines = 0;

        for (const variable of data.variables) {
            const newVariable = {
                name: variable.name,
                value: variable.value,
                varName: data.variableName,
            };
            this.variables.push(newVariable);

            let i = 1;
            processedLines = 0;
            let forEnd = false;
            while (!forEnd && i < textLines.length) {
                let line = textLines[i];
                processedLines++;
                let addLine = true;

                if (this.checkIfIfEnd(line)) {
                    addLine = false;
                } else if (this.checkIfElse(line)) {
                    addLine = false;
                } else if (this.checkIfForEnd(line)) {
                    addLine = false;
                    forEnd = true;
                } else if (this.checkIfForStart(line)) {
                    addLine = false;
                    const handled = this.handleFor(i, textLines);
                    processedLines += handled.lines;
                    i = handled.lines + i;
                    response.text += handled.text;
                } else if (this.checkIfIfStart(line)) {
                    addLine = false;
                    const handled = this.handleIf(i, textLines);
                    i = handled.i + i;
                    processedLines += handled.i;
                    response.text += handled.text;
                }

                if (addLine) {
                    line = this.replaceVariables(line);
                    response.text += line + '\n';
                }

                i++;
            }

            this.variables.pop();

            if (this.returnsJson && response.text.trim().length > 0) {
                response.text += ',';
            }
        }

        if (this.returnsJson) {
            response.text = response.text.slice(0, -1);
        }

        response.lines = processedLines;

        return response;
    }

    /**
     * Returs forEach informations
     *
     * @param {string} text forEach text
     *
     * @return {object} informations
     */
    getForEachData(text) {
        // FOR validation
        // eslint-disable-next-line max-len
        const valid = /%%forEach\s+[^\s]+\s+in\s+variables\s*%%\s*$|%%forEach\s+[^\s]+\s+of\s+variables\[\s*["'`]+.*["'`]+\s*\]\s*%%\s*$|%%forEach\s+[^\s]+\s+in\s+list\[\s*["'`]+.*["'`]+\s*\]\s*%%$/.
            test(text);

        if (!valid) {
            throw new Error(`Invalid for statement: ${text.trim()}`);
        }

        text = text.replace(/\s*%%forEach\s+/, '');

        const newVarName = /^\S+/.exec(text)[0];

        text = text.replace(/^\S+\s+/, '');

        const isIn = text.startsWith('in');
        let allVariables = this.configurationVariables;

        text = text.replace(/\S+\s+/, '');

        if (!isIn) {
            text = text.replace(/^variables\[\s*['"`]/, '');
            text = text.replace(/['"`]\s*\]\s*%%$/, '');

            const regex = new RegExp(text);

            allVariables = this.configurationVariables.filter((el) => {
                return regex.test(el.name);
            });
        } else {
            if (text.startsWith('list')) {
                text = text.replace(/^list\[\s*['"`]/, '');
                text = text.replace(/['"`]\s*\]\s*%%$/, '');

                const variable = this.configurationVariables.find( (el) => {
                    return el.name === text;
                });

                if (variable !== undefined && variable.type === 'list') {
                    allVariables = [];
                    variable.value.forEach( (el, index) => {
                        allVariables.push({
                            name: `${text}_${index}`,
                            value: el,
                            type: 'string',
                        });
                    });
                } else {
                    allVariables = [];
                }
            }
        }

        return {
            variableName: newVarName,
            variables: allVariables,
        };
    }
}
