import { PromotionsController } from './promotions.controller';
import axios from 'axios';

describe('PromotionsController', () => {
  let controller: PromotionsController;

  describe('find', () => {
    it('should return an array of promotions', async () => {
      const response = await axios.get('http://localhost:3000/promotions', {
        auth: {
          username: 'admin',
          password: 'admin',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.length).toBe(0);
    });
  });
});
