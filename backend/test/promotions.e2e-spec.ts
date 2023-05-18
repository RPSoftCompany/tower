import axios from 'axios';
import { MembersService } from '../src/modules/members/members.service';
import { GroupsService } from '../src/modules/groups/groups.service';
import { beforeAllHelper } from './helpers/beforeAllHelper';
import { BaseConfigurationsModule } from '../src/modules/base-configurations/base-configurations.module';
import { ConfigurationModelsModule } from '../src/modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from '../src/modules/configurations/configurations.module';
import { PromotionsModule } from '../src/modules/promotions/promotions.module';

describe('Promotions (e2e)', () => {
  const HOST = process.env.HOST ? process.env.HOST : 'localhost';
  const PORT = process.env.PORT ? process.env.PORT : '3000';

  const axiosHost = `http://${HOST}:${PORT}`;

  let token = null;

  let membersService: MembersService = null;
  let groupsService: GroupsService = null;
  let userId = null;
  let groupId = null;
  let newPromotionId = null;

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

  it('/promotions (POST no auth)', async () => {
    try {
      const response = await axios.post(`${axiosHost}/promotions`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/promotions`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions (PATCH no auth)', async () => {
    try {
      const response = await axios.patch(`${axiosHost}/promotions`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/promotions`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id (GET no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/promotions/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id (PATCH no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/promotions/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/promotions/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id (PUT no auth)', async () => {
    try {
      const response = await axios.put(`${axiosHost}/promotions`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id (DELETE no auth)', async () => {
    try {
      const response = await axios.delete(`${axiosHost}/promotions/testId`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/:id/exists (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/promotions/testId/exists`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions/count (GET no auth)', async () => {
    try {
      const response = await axios.get(`${axiosHost}/promotions/count`);
      expect(response.status).toBe(401);
    } catch (e) {
      expect(e.toJSON().status).toBe(401);
    }
  });

  it('/promotions (POST)', async () => {
    const response = await axios.post(
      `${axiosHost}/promotions`,
      {
        base: 'string',
        fromModel: 'string',
        toModels: ['string'],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(201);

    newPromotionId = response.data._id;
  });

  it('/promotions (GET)', async () => {
    const response = await axios.get(`${axiosHost}/promotions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]._id).toBe(newPromotionId);
  });

  it('/promotions (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/promotions`,
      {
        _id: newPromotionId,
        base: 'test 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.base).toBe('test 123');
  });

  it('/promotions (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/promotions`,
      {
        _id: newPromotionId,
        base: 'string',
        fromModel: 'string',
        toModels: ['string'],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.base).toBe('string');
  });

  it('/promotions/:id (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/promotions/${newPromotionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data[0].base).toBe('string');
  });

  it('/promotions/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/promotions/${newPromotionId}`,
      {
        base: 'string 123',
        fromModel: 'string',
        toModels: ['string'],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.base).toBe('string 123');
  });

  it('/promotions/:id (PATCH)', async () => {
    const response = await axios.patch(
      `${axiosHost}/promotions/${newPromotionId}`,
      {
        base: 'string 123',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.base).toBe('string 123');
  });

  it('/promotions/:id (PUT)', async () => {
    const response = await axios.put(
      `${axiosHost}/promotions/${newPromotionId}`,
      {
        base: 'string 123',
        fromModel: 'string 2',
        toModels: ['string 2'],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.fromModel).toBe('string 2');
  });

  it('/promotions/:id/exists (GET)', async () => {
    const response = await axios.get(
      `${axiosHost}/promotions/${newPromotionId}/exists`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.exists).toBe(true);
  });

  it('/promotions/count (GET)', async () => {
    const response = await axios.get(`${axiosHost}/promotions/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    expect(response.data).toBe(1);
  });

  it('/promotions/:id (DELETE)', async () => {
    const response = await axios.delete(
      `${axiosHost}/promotions/${newPromotionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    expect(response.status).toBe(204);
  });
});
