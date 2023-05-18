import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';
import { PromotionsModule } from '../src/modules/promotions/promotions.module';

describe('Roles (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let newRoleId = null;

  beforeAll(async () => {
    const all = await beforeAllHelper(
      [
        BaseConfigurationsModule,
        ConfigurationModelsModule,
        ConfigurationsModule,
        PromotionsModule,
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

  it('/roles (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/roles`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/roles`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/roles`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/roles`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/roles/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/roles/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/roles/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(`${axiosHost}/roles/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/roles/testId/exists`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/roles/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles/findOne (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/roles/findOne`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/roles (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/roles`,
      {
        name: 'string',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);
    expect(response.data.name).toBe('string');

    newRoleId = response.data._id;
  });

  it('/roles (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/roles`,
      {
        _id: newRoleId,
        name: 'string 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string 123');
  });

  it('/roles (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/roles`,
      {
        _id: newRoleId,
        name: 'string 123 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string 123 123');
  });

  it('/roles (GET)', async () => {
    const response = await axios.get(`${axiosHost}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(1);
  });

  it('/roles/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/roles/${newRoleId}`,
      {
        name: 'string',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string');
  });

  it('/roles/:id (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/roles/${newRoleId}`,
      {
        name: 'string 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string 123');
  });

  it('/roles/:id/exists (GET)', async () => {
    const response = await axios.get(`${axiosHost}/roles/${newRoleId}/exists`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.exists).toBe(true);
  });

  it('/roles/count (GET)', async () => {
    const response = await axios.get(`${axiosHost}/roles/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toBe(7);
  });

  it('/roles/findOne (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/roles/findOne?filter={"where":{"name":"string 123"}}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string 123');
  });

  it('/roles (DELETE)', async () => {
    const response = await axios.delete(`${axiosHost}/roles/${newRoleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(204);
  });
});
