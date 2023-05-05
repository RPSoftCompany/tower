import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';

describe('Groups (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let newGroupId = null;

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

  it('/groups (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/groups`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/groups`, {});
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/groups/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(`${axiosHost}/groups/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/:id/role (POST no auth)', async () => {
    try {
      const response = await axios.post(
        `${axiosHost}/groups/testId/role?role=role`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/:id/role (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/groups/testId/role?role=role`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/groups/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups/findOne (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/groups/findOne?filter={}`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/groups (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/groups`,
      {
        name: 'groupName',
        roles: [],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(response.status).toBe(201);
    expect(response.data._id).toBeTruthy();

    newGroupId = response.data._id;
  });

  it('/groups (DELETE)', async () => {
    const response = await axios.delete(`${axiosHost}/groups/${newGroupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(204);
  });

  it('/groups (GET)', async () => {
    const response = await axios.get(`${axiosHost}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it('/groups/:id (GET)', async () => {
    const response = await axios.get(`${axiosHost}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data._id).toBeTruthy();
  });

  it('/groups/:id/role (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/groups/${groupId}/role?role=configuration.view`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBeTruthy();
    expect(response.data.roles.includes('configuration.view')).toBe(true);
  });

  it('/groups/:id/role (DELETE)', async () => {
    const response = await axios.delete(
      `${axiosHost}/groups/${groupId}/role?role=configuration.view`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.roles.includes('configuration.view')).toBe(false);
  });

  it('/groups/count (GET)', async () => {
    const response = await axios.get(`${axiosHost}/groups/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toBe(1);
  });

  it('/groups/findOne (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/groups/findOne?filter={"where":{"name":"localTestingGroup"}}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBeTruthy();
  });
});
