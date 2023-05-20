import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { BaseConfigurationsService } from '../src/modules/base-configurations/base-configurations.service';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationModelsService } from '../src/modules/configuration-models/configuration-models.service';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';
import { ConfigurationsService } from '../src/modules/configurations/configurations.service';

describe('Configurations (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;
  let newId = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let baseConfigurationService: BaseConfigurationsService = null;
  let configurationModelsService: ConfigurationModelsService = null;
  let configurationsService: ConfigurationsService = null;

  beforeAll(async () => {
    const all = await beforeAllHelper(
      [
        BaseConfigurationsModule,
        ConfigurationModelsModule,
        ConfigurationsModule,
      ],
      ['configurationModel.view', 'configuration.view', 'configuration.modify'],
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

    configurationsService = all.module.get<ConfigurationsService>(
      ConfigurationsService,
    );

    const allBases = await baseConfigurationService.findAll();
    for (const base of allBases) {
      await baseConfigurationService.remove(base._id.toString());
    }

    const tokenResponse = await axios.post(`${axiosHost}/members/login`, {
      username: 'localTest',
      password: 'localTest',
    });

    if (tokenResponse.status === 200) {
      token = tokenResponse.data.id;
    }

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

  it('/configurations (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/configurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/configurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/configurations/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurations/testId/exists`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/configurations/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/findByDate (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurations/findByDate`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/findVariable (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurations/findVariable`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations/promotionCandidates (POST no auth)', async () => {
    try {
      const response = await axios.post(
        `${axiosHost}/configurations/promotionCandidates`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurations (POST)', async () => {
    try {
      const response = await axios.post(
        `${axiosHost}/configurations`,
        {
          variables: [
            {
              name: 'string',
              value: 'string',
              type: 'string',
            },
          ],
          Project: 'Project',
          Environment: 'Environment',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(response.status).toBe(201);

      newId = response.data._id;
    } catch (e) {
      expect(e.toJSON().status).toBe(201);
    }
  });

  it('/configurations (GET)', async () => {
    const response = await axios.get(`${axiosHost}/configurations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it('/configurations/:id (GET)', async () => {
    const response = await axios.get(`${axiosHost}/configurations/${newId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);
    expect(response.data._id).toBe(newId);
  });

  it('/configurations/:id/exists (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/configurations/${newId}/exists`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(response.status).toBe(200);
    expect(response.data.exists).toBe(true);
  });

  it('/configurations/exists (GET)', async () => {
    const response = await axios.get(`${axiosHost}/configurations/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBe(1);
  });

  it('/configurations/findByDate (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/configurations/findByDate?filter={"Project":"Project","Environment":"Environment"}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(newId);
  });

  it('/configurations/findByDate (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/configurations/findByDate?filter={"Project":"Project","Environment":"Environment"}&date=${new Date().toISOString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(newId);
  });

  it('/configurations/findVariable (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/configurations/findVariable?searchText=string&valueOrName=false&isRegex=false`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.variables[0].variables[0].name).toBe('string');

    await configurationsService.remove(newId);
  });

  it('/configurations/initialized (POST)', async () => {
    const response = await axios.get(`${axiosHost}/configurations/initialized`);

    expect(response.status).toBe(200);
  });

  it('/configurations/promotionCandidates (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/configurations/promotionCandidates`,
      {
        Project: 'Project',
        Environment: 'Environment',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);

    await configurationsService.remove(newId);
  });

  it('/configurations (POST without permissions)', async () => {
    await groupsService.removeRoleFromGroup(groupId, 'configuration.modify');

    try {
      await axios.post(
        `${axiosHost}/configurations`,
        {
          variables: [
            {
              name: 'string',
              value: 'string',
              type: 'string',
            },
          ],
          Project: 'Project',
          Environment: 'Environment',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurations (GET without permissions)', async () => {
    await groupsService.removeRoleFromGroup(groupId, 'configuration.view');

    try {
      await axios.get(`${axiosHost}/configurations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });
});
