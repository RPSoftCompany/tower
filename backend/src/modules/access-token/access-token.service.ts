import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import { AccessToken, AccessTokenDocument } from './access-token.schema';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { Cron } from '@nestjs/schedule';
import * as fs from 'node:fs';
import { readFileSync } from 'fs';

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
          iss: 'Tower',
          nonce: newToken.id,
          exp: Math.floor(Date.now() / 1000) + ttl,
        },
        process.env.SECRET,
      );
    }
  }

  /**
   * createAccessTokenFromJWT
   *
   * @param jwt
   * @param userId
   */
  async createAccessTokenFromJWT(jwt: JwtPayload, userId: string) {
    let ttl = Number(process.env.TTL);
    if (jwt.exp && jwt.iat) {
      ttl = jwt.exp - jwt.iat;
    }

    return await this.accessTokenModel.create({
      ttl: ttl,
      userId: userId,
      nonce: jwt.nonce,
    });
  }

  /**
   * signAccessToken
   *
   * @param tokenId
   */
  async signTechnicalAccessToken(tokenId: string) {
    return sign(
      {
        nonce: tokenId,
      },
      process.env.SECRET,
    );
  }

  /**
   * validateToken
   *
   * @param tokenId
   * @param isOpenId
   */
  async validateToken(
    tokenId: string,
    isOpenId?: boolean,
  ): Promise<AccessToken> | null {
    let match: any = {
      _id: tokenId,
    };
    if (isOpenId) {
      match = {
        nonce: tokenId,
      };
    }

    const token = await this.accessTokenModel.aggregate([
      {
        $match: match,
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
   * verifyOIDCToken
   *
   * @param token
   */
  verifyOIDCToken(token: string) {
    try {
      if (process.env.OIDC_SECRET_PRIVATE_KEY) {
        let secret = process.env.OIDC_SECRET_PRIVATE_KEY;
        if (fs.existsSync(process.env.OIDC_SECRET_PRIVATE_KEY)) {
          secret = readFileSync(process.env.OIDC_SECRET_PRIVATE_KEY).toString();
        }

        return verify(token, secret);
      }
    } catch (e) {
      return false;
    }

    return false;
  }

  /**
   * find
   *
   * @param filter
   */
  async find(filter?: Statement): Promise<Array<AccessToken>> {
    const newFilter = filterTranslator(filter);

    return this.accessTokenModel.find(
      newFilter.where,
      newFilter.fields as ProjectionType<any>,
      {
        sort: newFilter.order,
        limit: newFilter.limit,
        skip: newFilter.skip,
      },
    );
  }

  async logout(id: string) {
    const token = await this.validateToken(id);
    return this.accessTokenModel.findByIdAndDelete(token._id);
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
