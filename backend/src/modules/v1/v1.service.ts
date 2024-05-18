import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestConfiguration,
  RestConfigurationDocument,
} from '../rest-configurations/rest-configurations.schema';
import {
  BaseConfiguration,
  BaseConfigurationDocument,
} from '../base-configurations/base-configurations.schema';
import { ConfigurationsService } from '../configurations/configurations.service';
import {
  Configuration,
  ConfigurationVariable,
} from '../configurations/configuration.schema';
import { Liquid } from 'liquidjs';
import { ConstantVariablesService } from '../constant-variables/constant-variables.service';
import { ConnectionsService } from '../connections/connections.service';
import { Vault } from '../connections/VaultConnection.schema';
import { AWSConnection } from '../connections/AWSConnection.schema';

@Injectable()
export class V1Service {
  constructor(
    @InjectModel(RestConfiguration.name)
    private restConfigurationModel: Model<RestConfigurationDocument>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationDocument>,
    @Inject(ConfigurationsService)
    private readonly configurationService: ConfigurationsService,
    @Inject(ConstantVariablesService)
    private readonly constantVariablesService: ConstantVariablesService,
    @Inject(forwardRef(() => ConnectionsService))
    private readonly connectionsService: ConnectionsService,
  ) {}

  /**
   * matchUrl
   *
   * @param userRoles
   * @param url
   * @param type
   */
  async matchUrl(userRoles: string[], url: string, type?: string) {
    type ??= 'v1';

    const promises = [];
    promises.push(
      this.restConfigurationModel.find(undefined, undefined, {
        sort: { sequenceNumber: 1 },
      }),
    );

    promises.push(this.baseConfigurationModel.find());
    const promisesResponse = await Promise.all(promises);

    const restConfigurations: RestConfiguration[] = promisesResponse[0];
    const allBases: BaseConfiguration[] = promisesResponse[1];

    const toUse: RestConfiguration[] = [];

    if (restConfigurations.length > 0) {
      for (const restConfig of restConfigurations) {
        let modifiedUrl = `/${type}/${restConfig.url}`;

        for (const base of allBases) {
          modifiedUrl = modifiedUrl.replace(`{${base.name}}`, '[^\\/]*');
        }

        const regEx = new RegExp(modifiedUrl);

        if (regEx.test(url)) {
          toUse.push(restConfig);
        }
      }
    } else {
      throw new NotFoundException();
    }

    const configuration = await this.matchFirstConfiguration(
      userRoles,
      toUse,
      url,
      allBases,
    );

    return await this.compileConfiguration(
      userRoles,
      configuration.configuration,
      allBases,
      configuration.template,
    );
  }

  /**
   * compileConfiguration
   *
   * @param userRoles
   * @param configuration
   * @param allBases
   * @param template
   */
  async compileConfiguration(
    userRoles: string[],
    configuration: Configuration,
    allBases: BaseConfiguration[],
    template: RestConfiguration,
  ) {
    configuration = await this.incorporateConstantVariables(
      userRoles,
      allBases,
      configuration,
    );

    const variables = await this.incorporateVaultVariables(
      allBases,
      configuration,
    );

    await this.incorporateAWSSecretManagerVariables(allBases, configuration);

    configuration.variables = [...variables];

    configuration.variablesByName = {};
    configuration.variables.forEach((variable) => {
      configuration.variablesByName[variable.name] = variable.value;
    });

    let contentType = 'application/json';
    if (template.returnType === 'plain text') {
      contentType = 'text/plain';
    } else if (template.returnType === 'xml') {
      contentType = 'text/xml';
    }

    return {
      template: await this.renderTemplate(
        template.template,
        contentType,
        configuration,
      ),
      contentType: contentType,
    };
  }

  /**
   * matchFirstConfiguration
   *
   * @param userRoles
   * @param restConfigurations
   * @param url
   * @param allBases
   */
  async matchFirstConfiguration(
    userRoles: string[],
    restConfigurations: RestConfiguration[],
    url: string,
    allBases: BaseConfiguration[],
  ) {
    const type = 'v1';

    for (const config of restConfigurations) {
      const restUrl = `/${type}/${config.url}`;
      let tempUrl = url;

      const split = restUrl.split('{');

      const models: any = {};

      for (let i = 0; i < split.length; i++) {
        if (i === 0) {
          const regEx = new RegExp(`^${split[0]}`);
          tempUrl = tempUrl.replace(regEx, '');
        } else {
          const baseModel = split[i].substring(0, split[i].indexOf('}'));
          let afterModel = split[i].substring(
            split[i].indexOf('}'),
            split[i].length,
          );

          if (afterModel[1]) {
            afterModel = afterModel.substring(1, afterModel.length);
            const modelValue = tempUrl.substring(
              0,
              tempUrl.indexOf(afterModel),
            );

            tempUrl = tempUrl.substring(
              tempUrl.indexOf(afterModel) + afterModel.length,
              tempUrl.length,
            );
            models[baseModel] = modelValue;
          } else {
            models[baseModel] = tempUrl;
          }
        }
      }

      for (const base of allBases) {
        if (!models[base.name]) {
          models[base.name] = null;
        }
      }

      const configuration: Configuration[] =
        await this.configurationService.find(
          userRoles,
          {
            where: models,
            order: 'version DESC',
            limit: 1,
          },
          false,
        );

      if (configuration.length > 0) {
        return { configuration: configuration[0], template: config };
      }
    }

    throw new HttpException('Not found', 404);
  }

  /**
   * renderTemplate
   *
   * @param template
   * @param contentType
   * @param configuration
   */
  async renderTemplate(
    template: string,
    contentType: string,
    configuration: any,
  ) {
    const engine = new Liquid();

    engine.registerFilter('tower_toBase64', this.towerToBase64);
    engine.registerFilter('tower_random', this.towerRandom);
    engine.registerFilter('tower_toString', this.towerToString);
    engine.registerFilter(
      'tower_getVariableByName',
      this.towerGetVariableByName,
    );

    const clone: any = {};

    for (const key in configuration) {
      if (Array.isArray(configuration[key])) {
        if (contentType === 'application/json') {
          configuration[key].map((el) => {
            if (
              (el.type === 'string' || el.type === 'password') &&
              `${el.value}`.includes('"')
            ) {
              el.value = JSON.stringify(el.value).slice(1, -1);
            } else if (el.type === 'list') {
              el.value = el.value.map((listEl) => {
                listEl = JSON.stringify(listEl).slice(1, -1);
                return listEl;
              });
            }

            return el;
          });
        }
        clone[key] = [...configuration[key]];
      } else {
        clone[key] = configuration[key];
      }
    }

    return await engine.parseAndRender(template, clone);
  }

  /**
   * incorporateConstantVariables
   *
   * @param userRoles
   * @param allBases
   * @param configuration
   * @param date
   * @private
   */
  async incorporateConstantVariables(
    userRoles: string[],
    allBases: BaseConfiguration[],
    configuration: Configuration,
    date?: Date,
  ) {
    const bases: any = {};
    for (const base of allBases) {
      if (configuration[base.name] !== undefined) {
        bases[base.name] = configuration[base.name];
      }
    }

    const constVariables = await this.constantVariablesService.findByDate(
      userRoles,
      bases,
      date ? date : new Date(),
    );

    if (constVariables && constVariables.length > 0) {
      for (const constVariable of constVariables) {
        const index = configuration.variables.findIndex((el) => {
          return el.name === constVariable.name;
        });

        if (index >= 0) {
          if (constVariable.forced) {
            configuration.variables[index].type = constVariable.type;
            configuration.variables[index].value = constVariable.value;
            configuration.variables[index].valueKey = constVariable.valueKey;
          }
        } else {
          if (constVariable.addIfAbsent) {
            configuration.variables.push({
              name: constVariable.name,
              type: constVariable.type,
              value: constVariable.value,
              valueKey: constVariable.valueKey,
            });
          }
        }
      }
    }

    return configuration;
  }

  /**
   * towerToString
   *
   * @param {any} str any value
   * @return {string} value as string
   */
  towerToString(str: any) {
    return `${str}`;
  }

  /**
   * towerGetVariableByName
   *
   * @param {Array} variables
   * @param {string} name
   * @return {*|null}
   */
  towerGetVariableByName(variables: ConfigurationVariable[], name: string) {
    const found = variables.find((el) => {
      return el.name === name;
    });

    if (found) {
      return found;
    } else {
      return null;
    }
  }

  /**
   * incorporateVaultVariables
   *
   * @param allBases
   * @param configuration
   * @private
   */
  private async incorporateVaultVariables(
    allBases: BaseConfiguration[],
    configuration: Configuration,
  ) {
    const configurationBases: any = {};

    for (const base of allBases) {
      if (configuration[base.name]) {
        configurationBases[base.name] = configuration[base.name];
      }
    }

    for (const variable of configuration.variables) {
      if (variable.type === 'Vault') {
        variable.value = await this.connectionsService.getVaultVariable(
          configurationBases,
          variable.value.toString(),
        );
      }
    }

    return configuration.variables;
  }

  /**
   * incorporateAWSSecretManagerVariables
   *
   * @param allBases
   * @param configuration
   * @private
   */
  private async incorporateAWSSecretManagerVariables(
    allBases: BaseConfiguration[],
    configuration: Configuration,
  ) {
    const configurationBases: any = {};

    for (const base of allBases) {
      if (configuration[base.name]) {
        configurationBases[base.name] = configuration[base.name];
      }
    }

    const connections: AWSConnection[] = [];

    for (const variable of configuration.variables) {
      if (variable.type === 'AWS SM') {
        if (connections.length === 0) {
          const connectionsQuery =
            await this.connectionsService.getAWSConnections();
          for (const conn of connectionsQuery) {
            connections.push(conn as any as AWSConnection);
          }
        }

        variable.value = await this.connectionsService.getAWSSMVariable(
          connections,
          configurationBases,
          variable.value.toString(),
          variable.valueKey,
        );
      }
    }

    return configuration.variables;
  }

  /**
   * towerToString
   *
   * @param {string} str any value
   * @return {string} value as string
   */
  private towerToBase64(str: string): string {
    return btoa(str);
  }

  /**
   * towerRandom
   *
   * @param {number} from minimum value of the generated number
   * @param {number} to maximum value of the generated number
   *
   * @return {number} random number
   */
  private towerRandom(from, to) {
    if (from && to) {
      const min = Math.ceil(from);
      const max = Math.floor(to);
      return Math.floor(Math.random() * (max - min)) + min;
    } else {
      return Math.ceil(Math.random() * 100);
    }
  }
}
