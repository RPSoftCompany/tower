import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { BaseConfigurationsService } from '../src/modules/base-configurations/base-configurations.service';

describe('Configuration Models (e2e)', () => {
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
    const all = await beforeAllHelper(
      [BaseConfigurationsModule],
      ['configurationModel.view', 'configurationModel.modify'],
    );

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

    await baseConfigurationService.create({
      name: 'TEST',
      sequenceNumber: 0,
      icon: 'TEST',
    });
  });

  afterAll(async () => {
    await membersService.deleteUser(userId);
    await groupsService.remove(groupId);

    const allBases = await baseConfigurationService.findAll();
    for (const base of allBases) {
      await baseConfigurationService.remove(base._id.toString());
    }
  });

  it('/configurationModels (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/configurationModels`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/configurationModels`, {});
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/configurationModels`, {});
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/configurationModels`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/:id (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/testID`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(
        `${axiosHost}/configurationModels/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(
        `${axiosHost}/configurationModels/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/configurationModels/testID`,
        {},
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/testID/exists`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels/count (GET no auth)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/count`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels (PATCH)', async () => {
    // CREATE
    let response = await axios.patch(
      `${axiosHost}/configurationModels`,
      {
        name: 'string',
        rules: [
          {
            _id: '_id',
            targetValue: 'string',
            targetType: 'string',
            targetRegEx: false,
            conditionValue: 'string',
            conditionType: 'string',
            conditionRegEx: false,
            error: 'string',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: false,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);

    // UPDATE
    response = await axios.patch(
      `${axiosHost}/configurationModels`,
      {
        _id: response.data._id,
        rules: [],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.rules.length).toBe(0);

    // DELETE
    await axios.delete(
      `${axiosHost}/configurationModels/${response.data._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });

  it('/configurationModels (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/configurationModels`,
      {
        name: 'string',
        rules: [
          {
            _id: '_id',
            targetValue: 'string',
            targetType: 'string',
            targetRegEx: false,
            conditionValue: 'string',
            conditionType: 'string',
            conditionRegEx: false,
            error: 'string',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: false,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);

    // DELETE
    await axios.delete(
      `${axiosHost}/configurationModels/${response.data._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });

  it('/configurationModels (PUT)', async () => {
    // CREATE
    let response = await axios.put(
      `${axiosHost}/configurationModels`,
      {
        name: 'string',
        rules: [
          {
            _id: '_id',
            targetValue: 'string',
            targetType: 'string',
            targetRegEx: false,
            conditionValue: 'string',
            conditionType: 'string',
            conditionRegEx: false,
            error: 'string',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: false,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // UPDATE
    response = await axios.put(
      `${axiosHost}/configurationModels`,
      {
        _id: response.data._id,
        name: 'string 123',
        rules: [
          {
            _id: '_id',
            targetValue: 'string',
            targetType: 'string',
            targetRegEx: false,
            conditionValue: 'string',
            conditionType: 'string',
            conditionRegEx: false,
            error: 'string',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: false,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string 123');

    newId = response.data._id;
  });

  it('/configurationModels (GET)', async () => {
    let response = await axios.get(`${axiosHost}/configurationModels`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);

    // WITH FILTER
    response = await axios.get(
      `${axiosHost}/configurationModels?filter={"where":{"name":"string 123"}}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data[0].name).toBe('string 123');
    expect(response.data.length).toBe(1);
  });

  it('/configurationModels/:id (GET no auth)', async () => {
    const response = await axios.get(
      `${axiosHost}/configurationModels/${newId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data._id).toBe(newId);
  });

  it('/configurationModels/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/configurationModels/${newId}`,
      {
        name: 'string TEST',
        rules: [
          {
            _id: '_id TEST 123',
            targetValue: 'string 1',
            targetType: 'string 1',
            targetRegEx: true,
            conditionValue: 'string 1',
            conditionType: 'string 1',
            conditionRegEx: true,
            error: 'string 1',
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string TEST');
    expect(response.data.rules.length).toBe(1);
  });

  it('/configurationModels/:id (PUT no auth)', async () => {
    const response = await axios.put(
      `${axiosHost}/configurationModels/${newId}`,
      {
        name: 'string TEST PUT',
        rules: [
          {
            _id: '_id TEST',
            targetValue: 'string 1',
            targetType: 'string 1',
            targetRegEx: true,
            conditionValue: 'string 1',
            conditionType: 'string 1',
            conditionRegEx: true,
            error: 'string 1',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: true,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('string TEST PUT');
    expect(response.data.rules.length).toBe(1);
    expect(response.data.rules[0]._id).toBe('_id TEST');
    expect(response.data.restrictions.length).toBe(0);
    expect(response.data.options.hasRestrictions).toBe(true);
  });

  it('/configurationModels/:id (DELETE no auth)', async () => {
    const response = await axios.delete(
      `${axiosHost}/configurationModels/${newId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(204);
  });

  it('/configurationModels (PATCH basic auth)', async () => {
    // CREATE
    let response = await axios.patch(
      `${axiosHost}/configurationModels`,
      {
        name: 'string',
        rules: [
          {
            _id: '_id',
            targetValue: 'string',
            targetType: 'string',
            targetRegEx: false,
            conditionValue: 'string',
            conditionType: 'string',
            conditionRegEx: false,
            error: 'string',
          },
        ],
        restrictions: [],
        base: 'TEST',
        options: {
          hasRestrictions: false,
        },
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
      `${axiosHost}/configurationModels`,
      {
        _id: response.data._id,
        rules: [],
      },
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.rules.length).toBe(0);

    // DELETE
    await axios.delete(
      `${axiosHost}/configurationModels/${response.data._id}`,
      {
        auth: {
          username: 'localTest',
          password: 'localTest',
        },
      },
    );
  });

  it('/configurationModels/count (GET)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/count`,
      );
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/configurationModels (PATCH invalid role)', async () => {
    await groupsService.removeRoleFromGroup(
      groupId,
      'configurationModel.modify',
    );

    try {
      const response = await axios.patch(
        `${axiosHost}/configurationModels`,
        {
          name: 'string',
          rules: [
            {
              _id: '_id',
              targetValue: 'string',
              targetType: 'string',
              targetRegEx: false,
              conditionValue: 'string',
              conditionType: 'string',
              conditionRegEx: false,
              error: 'string',
            },
          ],
          restrictions: [],
          base: 'TEST',
          options: {
            hasRestrictions: false,
          },
        },
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels (POST invalid role)', async () => {
    try {
      const response = await axios.post(
        `${axiosHost}/configurationModels`,
        {
          name: 'string',
          rules: [
            {
              _id: '_id',
              targetValue: 'string',
              targetType: 'string',
              targetRegEx: false,
              conditionValue: 'string',
              conditionType: 'string',
              conditionRegEx: false,
              error: 'string',
            },
          ],
          restrictions: [],
          base: 'TEST',
          options: {
            hasRestrictions: false,
          },
        },
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels (PUT invalid role)', async () => {
    try {
      const response = await axios.put(
        `${axiosHost}/configurationModels`,
        {
          name: 'string',
          rules: [
            {
              _id: '_id',
              targetValue: 'string',
              targetType: 'string',
              targetRegEx: false,
              conditionValue: 'string',
              conditionType: 'string',
              conditionRegEx: false,
              error: 'string',
            },
          ],
          restrictions: [],
          base: 'TEST',
          options: {
            hasRestrictions: false,
          },
        },
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels/:id (PUT invalid role)', async () => {
    try {
      const response = await axios.put(
        `${axiosHost}/configurationModels/testId`,
        {
          name: 'string',
          rules: [
            {
              _id: '_id',
              targetValue: 'string',
              targetType: 'string',
              targetRegEx: false,
              conditionValue: 'string',
              conditionType: 'string',
              conditionRegEx: false,
              error: 'string',
            },
          ],
          restrictions: [],
          base: 'TEST',
          options: {
            hasRestrictions: false,
          },
        },
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels (PATCH invalid role)', async () => {
    try {
      const response = await axios.patch(
        `${axiosHost}/configurationModels/testId`,
        {
          name: 'string',
          rules: [
            {
              _id: '_id',
              targetValue: 'string',
              targetType: 'string',
              targetRegEx: false,
              conditionValue: 'string',
              conditionType: 'string',
              conditionRegEx: false,
              error: 'string',
            },
          ],
          restrictions: [],
          base: 'TEST',
          options: {
            hasRestrictions: false,
          },
        },
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels/:id (DELETE invalid role)', async () => {
    try {
      const response = await axios.delete(
        `${axiosHost}/configurationModels/testId`,
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels/:id (GET invalid role)', async () => {
    await groupsService.removeRoleFromGroup(groupId, 'configurationModel.view');

    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/testId`,
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });

  it('/configurationModels (GET invalid role)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/configurationModels`, {
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

  it('/configurationModels/count (GET invalid role)', async () => {
    try {
      const response = await axios.get(
        `${axiosHost}/configurationModels/count`,
        {
          auth: {
            username: 'localTest',
            password: 'localTest',
          },
        },
      );

      expect(response.status).toBe(403);
    } catch (e) {
      expect(e.toJSON().status).toBe(403);
    }
  });
});
