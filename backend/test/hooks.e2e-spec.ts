import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';

describe('Hooks (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let existingHookId = null;

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

  it('/hooks (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/hooks`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/hooks/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks/:id/hookObject (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/hooks/testId/hookObject`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks/:id/hookObject (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/hooks/testId/hookObject`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks/:id/hookObject/:fk (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/hooks/testId/hookObject/childId`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/hooks/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/hooks (GET)', async () => {
    const response = await axios.get(`${axiosHost}/hooks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(8);

    existingHookId = response.data[0]._id;
  });

  it('/hooks/:id (GET)', async () => {
    const response = await axios.get(`${axiosHost}/hooks/${existingHookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(existingHookId);
  });

  it('/hooks/:id/hookObject (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/hooks/${existingHookId}/hookObject`,
      {
        _id: 'string',
        url: 'string',
        template: 'string',
        method: 'GET',
        headers: [
          {
            name: 'string',
            value: 'string',
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);
    expect(response.data._id).toBe('string');
  });

  it('/hooks/:id/hookObject (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/hooks/${existingHookId}/hookObject`,
      {
        _id: 'string',
        url: 'string 123',
        template: 'string',
        method: 'GET',
        headers: [
          {
            name: 'string',
            value: 'string',
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.url).toBe('string 123');
  });

  it('/hooks/:id/hookObject (DELETE)', async () => {
    const response = await axios.delete(
      `${axiosHost}/hooks/${existingHookId}/hookObject/string`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(204);
  });

  it('/hooks/count (GET)', async () => {
    const response = await axios.get(`${axiosHost}/hooks/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toBe(8);
  });
});
