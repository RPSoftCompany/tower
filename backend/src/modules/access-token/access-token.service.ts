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
   * Generates and returns a new access token.
   *
   * @param {number} ttl - The time-to-live (TTL) of the token in seconds. Use -1 for a technical access token.
   * @param {string} userId - The ID of the user associated with the token.
   * @return {Promise<string>} A promise that resolves to the generated access token as a string.
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
   * Creates a new access token from a given JWT payload.
   *
   * @param {JwtPayload} jwt - The JSON Web Token payload containing information such as expiration and issued timestamps.
   * @param {string} userId - The ID of the user associated with the token.
   * @return {Promise<Object>} Resolves with the created access token object.
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
   * Signs a technical access token by generating a signature with the provided token ID and a secret.
   *
   * @param {string} tokenId - The unique identifier of the token to be signed.
   * @return {Promise<string>} A promise that resolves to the signed token as a string.
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
   * Validates a token by checking its expiration date and other properties.
   *
   * @param {string} tokenId - The unique identifier of the token to be validated.
   * @param {boolean} [isOpenId] - Optional flag indicating if the token is an OpenID token.
   * @return {Promise<AccessToken|null>} A promise that resolves to the AccessToken object if the token is valid, or null if it is invalid or expired.
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
   * Verifies the validity of a given JSON Web Token (JWT) using the specified secret.
   *
   * @param {string} token - The JWT token to be verified.
   * @return {object|boolean} Returns the decoded payload of the token if verification is successful, or false if verification fails.
   */
  verifyJWTToken(token: string) {
    try {
      return verify(token, process.env.SECRET);
    } catch (e) {
      return false;
    }
  }

  /**
   * Verifies an OpenID Connect (OIDC) token using the provided secret or private key.
   *
   * @param {string} token - The OIDC token to be verified.
   * @return {object|boolean} Returns the decoded token object if verification is successful,
   *                          otherwise returns false.
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
   * Finds and retrieves a list of access tokens based on the specified filter criteria.
   *
   * @param {Statement} [filter] - Optional filter criteria for querying the database.
   * @return {Promise<Array<AccessToken>>} A promise that resolves to an array of access tokens matching the filter criteria.
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
