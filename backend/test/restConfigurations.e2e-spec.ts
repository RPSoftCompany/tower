import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';

describe('RestConfigurations (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let newRestConfigId = null;

  beforeAll(async () => {
    const all = await beforeAllHelper(
      [
        BaseConfigurationsModule,
        ConfigurationModelsModule,
        ConfigurationsModule,
      ],
      ['admin'],
    );

    membersService = all.membersService;
    groupsService = all.groupsService;
    userId = all.userId;
    groupId = all.groupId;

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
  });

  it('/restConfigurations (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/restConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/restConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/restConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/restConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/restConfigurations/testId`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(
        `${axiosHost}/restConfigurations/testId`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(
        `${axiosHost}/restConfigurations/testId`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/restConfigurations/testId`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/restConfigurations/testId/exists`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/restConfigurations/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/restConfigurations (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/restConfigurations`,
      {
        url: 'http://string',
        returnType: 'json',
        template: 'string',
        sequenceNumber: 0,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);
    expect(response.data._id).toBeTruthy();

    newRestConfigId = response.data._id;
  });

  it('/restConfigurations (GET)', async () => {
    const response = await axios.get(`${axiosHost}/restConfigurations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it('/restConfigurations (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/restConfigurations`,
      {
        _id: newRestConfigId,
        template: 'string 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.template).toBe('string 123');
  });

  it('/restConfigurations (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/restConfigurations`,
      {
        _id: newRestConfigId,
        url: 'http://string',
        returnType: 'xml',
        template: 'string 123',
        sequenceNumber: 0,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.template).toBe('string 123');
  });

  it('/restConfigurations/:id/exists (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/restConfigurations/${newRestConfigId}/exists`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.exists).toBe(true);
  });

  it('/restConfigurations/:id (DELETE)', async () => {
    const response = await axios.delete(
      `${axiosHost}/restConfigurations/${newRestConfigId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
  });
});
