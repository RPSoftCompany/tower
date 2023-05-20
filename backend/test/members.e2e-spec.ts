import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';

describe('Members (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let newUserId = null;

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

    if (newUserId) {
      await membersService.deleteUser(newUserId);
    }
  });

  it('/members (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/members`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/members`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/members`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/members/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/members/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/members/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/members/testId/exists`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/changeUserPassword (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/members/changeUserPassword`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/getTechnicalUserToken (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/members/getTechnicalUserToken`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/getUserRoles (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/members/getUserRoles`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/logout (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/members/logout`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members/setAsTechnicalUser (POST no auth)', async () => {
    try {
      const response = await axios.post(
        `${axiosHost}/members/setAsTechnicalUser`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/members (PATCH)', async () => {
    let response = await axios.patch(
      `${axiosHost}/members`,
      {
        username: 'string',
        password: 'string',
        newUser: true,
        technicalUser: false,
        display: 'string',
        type: 'local',
        groups: [],
        blocked: false,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBeTruthy();

    newUserId = response.data._id;

    response = await axios.patch(
      `${axiosHost}/members`,
      {
        _id: newUserId,
        username: 'string 123',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(response.status).toBe(200);
    expect(response.data.username).toBe('string 123');
  });

  it('/members (GET)', async () => {
    const response = await axios.get(`${axiosHost}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(1);
  });

  it('/members (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/members`,
      {
        username: 'string 2',
        password: 'string',
        newUser: true,
        technicalUser: false,
        display: 'string',
        type: 'local',
        groups: [],
        blocked: false,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(response.status).toBe(201);
    expect(response.data._id).toBeTruthy();

    await membersService.deleteUser(response.data._id);
  });

  it('/members/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/members/${newUserId}`,
      {
        username: 'string 321',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(response.status).toBe(200);
    expect(response.data.username).toBe('string 321');
  });

  it('/members/:id (GET)', async () => {
    const response = await axios.get(`${axiosHost}/members/${newUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.username).toBe('string 321');
  });

  it('/members/:id (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/members/${newUserId}`,
      {
        username: 'string 2',
        password: 'string',
        newUser: true,
        technicalUser: false,
        display: 'string',
        type: 'local',
        groups: [],
        blocked: false,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    expect(response.status).toBe(200);
    expect(response.data.username).toBe('string 2');
  });

  it('/members/:id/exists (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/members/${newUserId}/exists`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.exists).toBe(true);
  });

  it('/members/changeUserPassword (POST)', async () => {
    let response = await axios.post(
      `${axiosHost}/members/changeUserPassword`,
      {
        newPassword: '777',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(204);

    response = await axios.post(`${axiosHost}/members/login`, {
      username: 'localTest',
      password: '777',
    });

    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();

    response = await axios.post(
      `${axiosHost}/members/logout`,
      {},
      { headers: { Authorization: `Bearer ${response.data.id}` } },
    );

    expect(response.status).toBe(204);
  });

  it('/members/getUserRoles (GET)', async () => {
    const response = await axios.get(`${axiosHost}/members/getUserRoles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toBe('admin');
  });

  it('/members/setAsTechnicalUser (GET)', async () => {
    const response = await axios.post(
      `${axiosHost}/members/setAsTechnicalUser?userId=${userId}&isTechUser=true`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();
  });
});
