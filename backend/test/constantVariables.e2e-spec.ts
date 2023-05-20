import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';
import { BaseConfigurationsService } from '../src/modules/base-configurations/base-configurations.service';
import { ConfigurationModelsService } from '../src/modules/configuration-models/configuration-models.service';
import { ConstantVariablesService } from '../src/modules/constant-variables/constant-variables.service';

describe('Constant Variables (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;
  let constVariableId = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let baseConfigurationService: BaseConfigurationsService = null;
  let configurationModelsService: ConfigurationModelsService = null;
  let constantVariablesService: ConstantVariablesService = null;
  let userId = null;
  let groupId = null;

  beforeAll(async () => {
    const all = await beforeAllHelper(
      [
        BaseConfigurationsModule,
        ConfigurationModelsModule,
        ConfigurationsModule,
      ],
      ['configuration.view', 'constantVariable.modify'],
    );

    membersService = all.membersService;
    groupsService = all.groupsService;
    userId = all.userId;
    groupId = all.groupId;

    baseConfigurationService = all.module.get<BaseConfigurationsService>(
      BaseConfigurationsService,
    );
    configurationModelsService = all.module.get<ConfigurationModelsService>(
      ConfigurationModelsService,
    );

    constantVariablesService = all.module.get<ConstantVariablesService>(
      ConstantVariablesService,
    );

    const tokenResponse = await axios.post(`${axiosHost}/members/login`, {
      username: 'localTest',
      password: 'localTest',
    });

    if (tokenResponse.status === 200) {
      token = tokenResponse.data.id;
    }
  });

  afterAll(async () => {
    await membersService.deleteUser(userId);
    await groupsService.remove(groupId);

    const allConfigModels = await configurationModelsService.find(['admin']);
    for (const configModel of allConfigModels) {
      await configurationModelsService.remove(
        ['admin'],
        (configModel as any)._id.toString(),
      );
    }

    const allBases = await baseConfigurationService.findAll();
    for (const base of allBases) {
      await baseConfigurationService.remove(base._id.toString());
    }
  });

  it('/constantVariables (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/constantVariables`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/constantVariables`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/constantVariables/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/constantVariables/testId/exists`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/constantVariables/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables/findByDate (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/constantVariables/findByDate`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables/findLatest (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/constantVariables/findLatest`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/constantVariables (POST without base models)', async () => {
    try {
      await axios.post(
        `${axiosHost}/constantVariables`,
        {
          variables: [
            {
              name: 'string',
              value: 'string',
              type: 'string',
              forced: true,
              addIfAbsent: true,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      expect(e.toJSON().status).toBe(400);
    }
  });

  it('/constantVariables (POST)', async () => {
    await baseConfigurationService.create({
      name: 'Project',
      sequenceNumber: 0,
      icon: 'TEST',
    });

    await baseConfigurationService.create({
      name: 'Environment',
      sequenceNumber: 1,
      icon: 'TEST',
    });

    await configurationModelsService.create({
      name: 'Environment',
      rules: [],
      restrictions: [],
      base: 'Environment',
      options: {
        hasRestrictions: false,
      },
    });

    await configurationModelsService.create({
      name: 'Project',
      rules: [],
      restrictions: [],
      base: 'Project',
      options: {
        hasRestrictions: false,
      },
    });

    const response = await axios.post(
      `${axiosHost}/constantVariables`,
      {
        Project: 'Project',
        variables: [
          {
            name: 'string',
            value: 'string',
            type: 'string',
            forced: true,
            addIfAbsent: true,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);
    expect(response.data._id).toBeTruthy();

    constVariableId = response.data._id;
  });

  it('/constantVariables/:id (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/constantVariables/${constVariableId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(constVariableId);
  });

  it('/constantVariables/count (GET)', async () => {
    const response = await axios.get(`${axiosHost}/constantVariables/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toBe(1);
  });

  it('/constantVariables/findByDate (GET without date)', async () => {
    const response = await axios.get(
      `${axiosHost}/constantVariables/findByDate?filter={"Project":"Project","Environment":"Environment"}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it('/constantVariables/findByDate (GET with date)', async () => {
    const response = await axios.get(
      `${axiosHost}/constantVariables/findByDate?filter={"Project":"Project","Environment":"Environment"}&date=${new Date().toISOString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it('/constantVariables/findLatest (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/constantVariables/findBLatest?filter={"Project":"Project","Environment":"Environment"}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);

    await constantVariablesService.remove(constVariableId);
  });
});
