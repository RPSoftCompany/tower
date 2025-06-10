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
import { AWSConnection } from '../connections/AWSConnection.schema';
import { ConfigurationModelDocument } from '../configuration-models/configuration-models.schema';
import { ConfigurationModelsModule } from '../configuration-models/configuration-models.module';
import { AzureConnection } from '../connections/AzureConnection.schema';
import { KeyVaultSecret } from '@azure/keyvault-secrets';
import { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager/dist-types/commands';
import { isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class V1Service {
  constructor(
    @InjectModel(RestConfiguration.name)
    private restConfigurationModel: Model<RestConfigurationDocument>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationDocument>,
    @InjectModel(ConfigurationModelsModule.name)
    private configurationModel: Model<ConfigurationModelDocument>,
    @Inject(ConfigurationsService)
    private readonly configurationService: ConfigurationsService,
    @Inject(ConstantVariablesService)
    private readonly constantVariablesService: ConstantVariablesService,
    @Inject(forwardRef(() => ConnectionsService))
    private readonly connectionsService: ConnectionsService,
  ) {}

  /**
   * Matches the given URL against a set of configurations based on user roles and additional parameters.
   *
   * @param {string[]} userRoles - An array of roles associated with the current user.
   * @param {string} url - The URL to be matched against the configuration rules.
   * @param {string} [type] - The type of configuration to be used. Defaults to 'v1' if not provided.
   * @param {any} [params] - Additional parameters, which may include optional version information.
   * @return {Promise<any>} A promise that resolves to the compiled configuration result if a match is found.
   * @throws {NotFoundException} If no matching configuration is found.
   */
  async matchUrl(
    userRoles: string[],
    url: string,
    type?: string,
    params?: any,
  ) {
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
      params.version ? params.version : undefined,
    );

    return await this.compileConfiguration(
      userRoles,
      configuration.configuration,
      allBases,
      configuration.template,
    );
  }

  /**
   * Compiles a configuration object by incorporating base configurations and rendering a template.
   *
   * @param {string[]} userRoles - List of user roles to consider during the configuration compilation.
   * @param {Configuration} configuration - The initial configuration object to be processed.
   * @param {BaseConfiguration[]} allBases - Array of base configurations to merge with the initial configuration.
   * @param {RestConfiguration} template - Template and metadata used for rendering the final configuration.
   * @return {Promise<{template: string, contentType: string}>} An object containing the rendered template and its corresponding content type.
   */
  async compileConfiguration(
    userRoles: string[],
    configuration: Configuration,
    allBases: BaseConfiguration[],
    template: RestConfiguration,
  ) {
    configuration = await this.incorporateAll(
      userRoles,
      allBases,
      configuration,
    );

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
   * Asynchronously incorporates various configurations and variables into the provided configuration object.
   *
   * @param {string[]} userRoles - Array of user roles utilized during the incorporation process.
   * @param {BaseConfiguration[]} allBases - Array of base configurations to be used.
   * @param {Configuration} configuration - The initial configuration object to be augmented.
   * @return {Promise<Configuration>} A promise that resolves to the updated configuration object.
   */
  async incorporateAll(
    userRoles: string[],
    allBases: BaseConfiguration[],
    configuration: Configuration,
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

    configuration.variables = [...variables];

    await this.incorporateAWSSecretManagerVariables(allBases, configuration);
    await this.incorporateAzureKeyVaultVariables(allBases, configuration);

    return configuration;
  }

  /**
   * Matches the first valid configuration for the given URL and user roles
   * against a list of REST configurations and base configurations.
   *
   * @param {string[]} userRoles - An array of user roles to filter configurations by access.
   * @param {RestConfiguration[]} restConfigurations - An array of REST configurations to match against.
   * @param {string} url - The URL to match against the REST configurations.
   * @param {BaseConfiguration[]} allBases - An array of base configurations to validate the data models.
   * @param {string} [version] - Optional version string to fetch a specific configuration version.
   * @return {Promise<{ configuration: Configuration, template: RestConfiguration }>} Returns an object containing
   *         the matching configuration and its related template if found. Otherwise, throws an exception.
   */
  async matchFirstConfiguration(
    userRoles: string[],
    restConfigurations: RestConfiguration[],
    url: string,
    allBases: BaseConfiguration[],
    version?: string,
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
            models[`__metadata.${baseModel}`] = modelValue;
          } else {
            models[`__metadata.${baseModel}`] = tempUrl;
          }
        }
      }

      const findArray = [];

      for (const base of allBases) {
        if (!models[`__metadata.${base.name}`]) {
          models[`__metadata.${base.name}`] = null;
        } else {
          findArray.push({
            name: models[`__metadata.${base.name}`],
            base: base.name,
          });
        }
      }

      if (allBases.length === 0) {
        throw new NotFoundException();
      }

      //Checks if a user is querying for non-existent model
      const count = await this.configurationModel.countDocuments({
        $or: findArray,
      });

      if (count !== findArray.length) {
        throw new NotFoundException();
      }

      let configuration: Configuration;

      if (version === undefined) {
        configuration = (await this.configurationService.findLatest(
          userRoles,
          {
            where: models,
          },
          false,
        )) as Configuration;
      } else {
        configuration = (await this.configurationService.findLatest(
          userRoles,
          {
            where: models,
          },
          false,
        )) as Configuration;
      }

      if (configuration) {
        return { configuration: configuration, template: config };
      }
    }

    throw new HttpException('Not found', 404);
  }

  /**
   * Renders a given template string using the Liquid templating engine and a provided configuration object.
   * This method supports various custom filters and adjusts configuration data based on the specified content type.
   *
   * @param {string} template - The template string to be rendered.
   * @param {string} contentType - The MIME type of the content, such as 'application/json'.
   * @param {any} configuration - An object containing the dynamic variables to be used in the template.
   * @return {Promise<string>} The rendered template as a string.
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
   * Incorporates constant variables into the provided configuration based on user roles, base configurations, and an optional date.
   *
   * @param {string[]} userRoles - An array of user roles used to determine the applicable constant variables.
   * @param {BaseConfiguration[]} allBases - An array of all available base configurations.
   * @param {Configuration} configuration - The configuration object to be modified and updated with constant variables.
   * @param {Date} [date] - An optional date to filter which constant variables are applicable. Defaults to the current date if not provided.
   * @return {Configuration} The updated configuration object with incorporated constant variables.
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
      !date,
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
   * Converts the given input to a string representation.
   *
   * @param {any} str - The input to be converted to a string.
   * @return {string} The string representation of the input.
   */
  towerToString(str: any) {
    return `${str}`;
  }

  /**
   * Retrieves a configuration variable by its name from an array of variables.
   *
   * @param {ConfigurationVariable[]} variables - The array of configuration variables to search through.
   * @param {string} name - The name of the variable to retrieve.
   * @return {ConfigurationVariable | null} The found configuration variable, or null if no match is found.
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
   * Incorporates Vault variables into the given configuration by updating variable values
   * based on data retrieved from Vault.
   *
   * @param {BaseConfiguration[]} allBases - An array of base configurations to check against the current configuration.
   * @param {Configuration} configuration - The main configuration object containing variables to be updated and their associated base configurations.
   * @return {Variable[]} Returns an updated array of configuration variables with Vault variables resolved to their actual values.
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
   * Incorporates AWS Secret Manager variables into the current configuration by retrieving
   * and replacing the specified configuration variables that are sourced from AWS Secret Manager.
   *
   * @param {BaseConfiguration[]} allBases - An array of base configurations that define the available base settings.
   * @param {Configuration} configuration - The current configuration object to be updated, containing variables and references to be resolved.
   * @return {Promise<ConfigurationVariable[]>} - Returns a Promise resolving to the updated array of configuration variables.
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

    const allPromises: Promise<GetSecretValueCommandOutput>[] = [];
    const variableIteratorArray: number[] = [];

    for (let i = 0; i < configuration.variables.length; i++) {
      let variable = configuration.variables[i];
      if (variable.type === 'AWS SM') {
        if (connections.length === 0) {
          const connectionsQuery =
            await this.connectionsService.getAWSConnections();
          for (const conn of connectionsQuery) {
            connections.push(conn as any as AWSConnection);
          }
        }

        variableIteratorArray.push(i);

        allPromises.push(
          this.connectionsService.getAWSSMVariable(
            connections,
            configurationBases,
            variable.value.toString(),
            variable.valueKey,
          ),
        );
      }
    }

    const all = await Promise.all(allPromises);

    for (let i = 0; i < all.length; i++) {
      const key = variableIteratorArray[i];
      if (!isNil(all[i])) {
        const tempJson = JSON.parse(all[i].SecretString);
        configuration.variables[key].value =
          tempJson[configuration.variables[key].valueKey];
      }
    }

    return configuration.variables;
  }

  /**
   * Incorporates Azure Key Vault variables into the given configuration. This method retrieves secrets from Azure Key Vault
   * based on the specified configuration and updates the configuration variables with the retrieved secret values.
   *
   * @param {BaseConfiguration[]} allBases - An array of base configuration objects that define the structure and type of configurations.
   * @param {Configuration} configuration - The current configuration object containing variables that may need to fetch values from Azure Key Vault.
   * @return {Promise<Variable[]>} A promise that resolves to an updated array of configuration variables with retrieved values from Azure Key Vault.
   */
  private async incorporateAzureKeyVaultVariables(
    allBases: BaseConfiguration[],
    configuration: Configuration,
  ) {
    const configurationBases: any = {};

    for (const base of allBases) {
      if (configuration[base.name]) {
        configurationBases[base.name] = configuration[base.name];
      }
    }

    const connections: AzureConnection[] = [];

    const allPromises: Promise<KeyVaultSecret>[] = [];
    const variableIteratorArray: number[] = [];

    for (let i = 0; i < configuration.variables.length; i++) {
      let variable = configuration.variables[i];

      if (variable.type === 'AZURE keyVault') {
        if (connections.length === 0) {
          const connectionsQuery =
            await this.connectionsService.getAzureConnections();

          for (const conn of connectionsQuery) {
            connections.push(conn as any as AzureConnection);
          }
        }

        variableIteratorArray.push(i);

        allPromises.push(
          this.connectionsService.getAzureKeyVaultVariable(
            connections,
            configurationBases,
            variable.value.toString(),
          ),
        );
      }
    }

    const all = await Promise.all(allPromises);

    for (let i = 0; i < all.length; i++) {
      const key = variableIteratorArray[i];
      configuration.variables[key].value = all[i].value;
    }

    return configuration.variables;
  }

  /**
   * Converts the provided string to a Base64 encoded string.
   *
   * @param {string} str - The input string to be encoded.
   * @return {string} The Base64 encoded representation of the input string.
   */
  private towerToBase64(str: string): string {
    return btoa(str);
  }

  /**
   * Generates a random number within a given range or defaults to a random number between 1 and 100.
   *
   * @param {number} from - The lower bound of the range (inclusive).
   * @param {number} to - The upper bound of the range (exclusive).
   * @return {number} A random integer within the specified range if both `from` and `to` are provided, or a random integer between 1 and 100 if they are not.
   */
  private towerRandom(from: number, to: number) {
    if (from && to) {
      const min = Math.ceil(from);
      const max = Math.floor(to);
      return Math.floor(Math.random() * (max - min)) + min;
    } else {
      return Math.ceil(Math.random() * 100);
    }
  }
}
