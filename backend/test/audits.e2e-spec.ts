import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';

describe('Audits (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;

  beforeAll(async () => {
    const all = await beforeAllHelper();

    membersService = all.membersService;
    groupsService = all.groupsService;
    userId = all.userId;
    groupId = all.groupId;

    const tokenResponse = await axios.post(`${axiosHost}/members/login`, {
      username: 'admin',
      password: 'admin',
    });

    if (tokenResponse.status === 200) {
      token = tokenResponse.data.id;
    }
  });

  afterAll(async () => {
    await membersService.deleteUser(userId);
    await groupsService.remove(groupId);
  });

  it('/audits (GET no auth)', async () => {
    expect.assertions(1);

    try {
      const response = await axios.get(`${axiosHost}/audits`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/audits/count (GET no auth)', async () => {
    expect.assertions(1);

    try {
      const response = await axios.get(`${axiosHost}/audits/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/audits (GET)', async () => {
    expect.assertions(1);

    const response = await axios.get(`${axiosHost}/audits?filter={"limit":1}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
  });

  it('/audits (GET with filter)', async () => {
    expect.assertions(1);

    const response = await axios.get(
      `${axiosHost}/audits?filter={"where":{"entity":"configurations"},"limit":1}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
  });

  it('/audits/count (GET)', async () => {
    expect.assertions(1);

    const response = await axios.get(`${axiosHost}/audits/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
  });

  it('/audits (GET role auth)', async () => {
    expect.assertions(1);

    const response = await axios.get(`${axiosHost}/audits?filter={"limit":1}`, {
      auth: {
        username: 'localTest',
        password: 'localTest',
      },
    });

    expect(response.status).toBe(200);
  });

  it('/audits/count (GET role auth)', async () => {
    expect.assertions(1);

    const response = await axios.get(`${axiosHost}/audits/count`, {
      auth: {
        username: 'localTest',
        password: 'localTest',
      },
    });

    expect(response.status).toBe(200);
  });

  it('/audits (GET role auth without permissions)', async () => {
    expect.assertions(1);

    await groupsService.removeRoleFromGroup(groupId, 'admin');

    try {
      const response = await axios.get(`${axiosHost}/audits`, {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      });
      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/audits/count (GET role auth without permissions)', async () => {
    expect.assertions(1);

    try {
      const response = await axios.get(`${axiosHost}/audits/count`, {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      });
      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });
});
