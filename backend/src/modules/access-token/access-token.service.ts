import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccessToken, AccessTokenDocument } from './access-token.schema';
import { sign, verify } from 'jsonwebtoken';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AccessTokenService {
  private readonly logger = new Logger(AccessTokenService.name);
  constructor(
    @InjectModel(AccessToken.name)
    private accessTokenModel: Model<AccessTokenDocument>,
  ) {}

  @Cron('0 0,15,30,45 * * * *')
  async tokenCleanup() {
    const expired = await this.accessTokenModel.aggregate([
      {
        $match: {
          ttl: {
            $exists: true,
            $ne: -1,
          },
          created: {
            $exists: true,
          },
        },
      },
      {
        $project: {
          id: 1,
          expirationDate: {
            $dateAdd: {
              startDate: '$created',
              unit: 'second',
              amount: '$ttl',
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $lte: ['$expirationDate', '$$NOW'],
          },
        },
      },
    ]);

    for (const el of expired) {
      try {
        await this.accessTokenModel.findByIdAndDelete(el._id);
      } catch (e) {
        this.logger.error(e);
      }
    }

    this.logger.debug(
      `Token cleanup completed, ${expired.length} tokens removed`,
    );
  }

  /**
   * createAccessToken
   *
   * @param ttl
   * @param userId
   */
  async createAccessToken(ttl: number, userId: string): Promise<string> {
    const newToken = await this.accessTokenModel.create({
      ttl: ttl,
      userId: userId,
    });

    if (ttl === -1) {
      return this.signTechnicalAccessToken(newToken.id);
    } else {
      return sign(
        {
          data: { tokenId: newToken.id },
          exp: Math.floor(Date.now() / 1000) + ttl,
        },
        process.env.SECRET,
      );
    }
  }

  /**
   * signAccessToken
   *
   * @param ttl
   * @param tokenId
   */
  async signTechnicalAccessToken(tokenId) {
    return sign(
      {
        data: { tokenId: tokenId },
      },
      process.env.SECRET,
    );
  }

  /**
   * validateToken
   *
   * @param tokenId
   */
  async validateToken(tokenId: string): Promise<AccessToken> | null {
    const token = await this.accessTokenModel.aggregate([
      {
        $match: {
          _id: tokenId,
        },
      },
      {
        $project: {
          userId: true,
          expirationDate: {
            $dateAdd: {
              startDate: '$created',
              unit: 'second',
              amount: '$ttl',
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              {
                $lte: ['expirationDate', '$$NOW'],
              },
              {
                ttl: -1,
              },
            ],
          },
        },
      },
    ]);

    if (token[0]) {
      return this.accessTokenModel.populate(token[0], 'userId');
    }

    return null;
  }

  /**
   * verifyJWTToken
   *
   * @param token
   */
  verifyJWTToken(token: string) {
    try {
      return verify(token, process.env.SECRET);
    } catch (e) {
      return false;
    }
  }

  /**
   * find
   *
   * @param filter
   */
  async find(filter?: Statement): Promise<Array<AccessToken>> {
    const newFilter = filterTranslator(filter);

    return this.accessTokenModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  async logout(id: string) {
    return this.accessTokenModel.findByIdAndDelete(id);
  }

  async createTechnicalUserToken(id: string, createNewToken: boolean) {
    await this.accessTokenModel.deleteMany({
      userId: new Types.ObjectId(id),
    });

    if (createNewToken) {
      return await this.createAccessToken(-1, id);
    }
  }
}
