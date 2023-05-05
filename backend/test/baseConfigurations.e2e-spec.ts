import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { BaseConfigurationsService } from '../src/modules/base-configurations/base-configurations.service';

describe('Base Configurations (e2e)', () => {
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

  beforeAll(async () => {
    const all = await beforeAllHelper([BaseConfigurationsModule]);

    membersService = all.membersService;
    groupsService = all.groupsService;
    userId = all.userId;
    groupId = all.groupId;
    baseConfigurationService = all.module.get<BaseConfigurationsService>(
      BaseConfigurationsService,
    );

    const allBases = await baseConfigurationService.findAll();
    for (const base of allBases) {
      await baseConfigurationService.remove(base._id.toString());
    }

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

    const allBases = await baseConfigurationService.findAll();
    for (const base of allBases) {
      await baseConfigurationService.remove(base._id.toString());
    }
  });

  it('/baseConfigurations (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/baseConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/baseConfigurations`, {});
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/baseConfigurations`, {});
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/baseConfigurations`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/baseConfigurations/testID`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(
        `${axiosHost}/baseConfigurations/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(
        `${axiosHost}/baseConfigurations/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/baseConfigurations/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/baseConfigurations (PATCH)', async () => {
    // CREATE
    let response = await axios.patch(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
        icon: 'TEST',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);

    // UPDATE
    response = await axios.patch(
      `${axiosHost}/baseConfigurations`,
      {
        _id: response.data._id,
        name: 'TEST NEW',
        sequenceNumber: 1000,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);

    // DELETE
    await axios.delete(`${axiosHost}/baseConfigurations/${response.data._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('/baseConfigurations (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);

    // DELETE
    await axios.delete(`${axiosHost}/baseConfigurations/${response.data._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('/baseConfigurations (PUT)', async () => {
    // CREATE
    let response = await axios.put(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
        icon: 'test',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // UPDATE
    response = await axios.put(
      `${axiosHost}/baseConfigurations`,
      {
        _id: response.data._id,
        name: 'TEST NEW',
        sequenceNumber: 1000,
        icon: 'test',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);

    newId = response.data._id;
  });

  it('/baseConfigurations (GET)', async () => {
    let response = await axios.get(`${axiosHost}/baseConfigurations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);

    // WITH FILTER
    response = await axios.get(
      `${axiosHost}/baseConfigurations?filter={"where":{"name":"TEST NEW"}}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data[0].name).toBe('TEST NEW');
  });

  it('/baseConfigurations/:id (GET no auth)', async () => {
    const response = await axios.get(
      `${axiosHost}/baseConfigurations/${newId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(newId);
  });

  it('/baseConfigurations/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/baseConfigurations/${newId}`,
      {
        name: 'TEST PATCH',
        sequenceNumber: 1001,
        icon: 'test patch',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('TEST PATCH');
    expect(response.data.sequenceNumber).toBe(1001);
    expect(response.data.icon).toBe('test patch');
  });

  it('/baseConfigurations/:id (PUT no auth)', async () => {
    const response = await axios.put(
      `${axiosHost}/baseConfigurations/${newId}`,
      {
        name: 'TEST PUT',
        sequenceNumber: 1002,
        icon: 'test put',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('TEST PUT');
    expect(response.data.sequenceNumber).toBe(1002);
    expect(response.data.icon).toBe('test put');
  });

  it('/baseConfigurations/:id (DELETE no auth)', async () => {
    const response = await axios.delete(
      `${axiosHost}/baseConfigurations/${newId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(204);
  });

  it('/baseConfigurations (PATCH basic auth)', async () => {
    // CREATE
    let response = await axios.patch(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
        icon: 'TEST',
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(200);

    // UPDATE
    response = await axios.patch(
      `${axiosHost}/baseConfigurations`,
      {
        _id: response.data._id,
        name: 'TEST NEW',
        sequenceNumber: 1000,
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(200);

    // DELETE
    await axios.delete(`${axiosHost}/baseConfigurations/${response.data._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('/baseConfigurations (POST basic auth)', async () => {
    const response = await axios.post(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(201);

    // DELETE
    await axios.delete(`${axiosHost}/baseConfigurations/${response.data._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('/baseConfigurations (PUT basic auth)', async () => {
    // CREATE
    let response = await axios.put(
      `${axiosHost}/baseConfigurations`,
      {
        name: 'TEST',
        sequenceNumber: 1000,
        icon: 'test',
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    // UPDATE
    response = await axios.put(
      `${axiosHost}/baseConfigurations`,
      {
        _id: response.data._id,
        name: 'TEST NEW',
        sequenceNumber: 1000,
        icon: 'test',
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(200);

    newId = response.data._id;
  });

  it('/baseConfigurations (GET basic auth)', async () => {
    let response = await axios.get(`${axiosHost}/baseConfigurations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);

    // WITH FILTER
    response = await axios.get(
      `${axiosHost}/baseConfigurations?filter={"where":{"name":"TEST NEW"}}`,
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data[0].name).toBe('TEST NEW');
  });
});
