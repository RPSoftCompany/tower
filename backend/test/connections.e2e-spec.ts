import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';

describe('Connections (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;
  let ldapId = null;
  let scpId = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;

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

  it('/connections (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/connections`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/connections (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/connections`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/connections/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/connections/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/connections/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(`${axiosHost}/connections/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/connections/testConnection (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/connections/testConnections`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/connections (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/connections?filter={"where":{"system":"LDAP"}}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);

    ldapId = response.data[0]._id;
  });

  it('/connections (GET)', async () => {
    const response = await axios.get(`${axiosHost}/connections/${ldapId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(ldapId);
  });

  it('/connections (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/connections`,
      {
        _id: ldapId,
        system: 'LDAP',
        enabled: false,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(response.status).toBe(200);
  });

  it('/connections (PATCH create SCP connection)', async () => {
    const response = await axios.patch(
      `${axiosHost}/connections`,
      {
        system: 'SCP',
        enabled: false,
        host: 'test',
        username: 'test',
        password: 'test',
        authType: 'userpass',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(response.status).toBe(200);
    expect(response.data._id).toBeTruthy();

    scpId = response.data._id;
  });

  it('/connections (DELETE create SCP connection)', async () => {
    const response = await axios.delete(`${axiosHost}/connections/${scpId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(204);
  });

  it('/connections (GET without permissions)', async () => {
    await groupsService.removeRoleFromGroup(groupId, 'admin');

    try {
      const response = await axios.get(`${axiosHost}/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });
});
