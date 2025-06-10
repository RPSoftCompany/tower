import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  Scope,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenService } from '../modules/access-token/access-token.service';
import { decode } from 'base-64';
import { MembersService } from '../modules/members/members.service';
import { Reflector } from '@nestjs/core';
import { Member } from '../modules/members/member.schema';
import { GroupsService } from '../modules/groups/groups.service';
import * as process from 'process';
import { InjectModel } from '@nestjs/mongoose';
import { Audit } from '../modules/audits/audits.schema';
import { Model } from 'mongoose';
import { AuditsModule } from '../modules/audits/audits.module';
import { stringify } from 'ts-jest';
import { JwtPayload } from 'jsonwebtoken';

interface TowerJWTToken {
  data: {
    tokenId: string;
  };
}
@Injectable({ scope: Scope.REQUEST })
export class TowerAuthGuard implements CanActivate {
  private readonly logger = new Logger(TowerAuthGuard.name);

  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditsModule>,
    private readonly accessTokenService: AccessTokenService,
    private readonly membersService: MembersService,
    private readonly groupsService: GroupsService,
    private reflector: Reflector,
  ) {}

  /**
   * Determines whether a request can proceed based on validations such as headers, query parameters, user roles, and other criteria.
   *
   * @param {ExecutionContext} context - The execution context of the incoming request. Provides access to request details and handlers.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the request is authorized to proceed.
   * @throws {ServiceUnavailableException} If the system environment is not initialized correctly.
   * @throws {UnauthorizedException} If the user is blocked or unauthorized based on roles or access tokens.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let user: Member | null = null;

    if (!process.env.SECRET || process.env.SECRET.length !== 32) {
      throw new ServiceUnavailableException(
        'Tower was not initialized correctly',
      );
    }

    let roles = this.reflector.get<string[]>('roles', context.getHandler());

    roles ??= [];

    // Check header
    user = await this.validateTowerHeaders(request);

    if (user && user.blocked) {
      throw new UnauthorizedException('User blocked');
    }

    if (user) {
      request.__userData = user;
      return this.validateRoles(request, roles, user);
    }

    // Check query params
    if (request.query['access_token']) {
      user = await this.validateToken(request, request.query['access_token']);

      if (user && user.blocked) {
        throw new UnauthorizedException('User blocked');
      }

      if (user) {
        request.__userData = user;
        return this.validateRoles(request, roles, user);
      }
    }

    const pathname = request._parsedUrl.pathname;
    const body =
      typeof request.body === 'object'
        ? JSON.stringify(request.body)
        : request.body;

    const obj: Audit = {
      entity: pathname.match(/^\/[^\/]+/, '')[0].replace(/^./, ''),
      method: request.method,
      query: JSON.stringify(request.query),
      status: 'ERROR',
      body: body,
      url: pathname,
      userId: null,
      statusCode: 401,
      errorDescription: 'Unauthorized',
    };

    await this.auditModel.create(obj);

    throw new UnauthorizedException();
  }

  /**
   * Validates a given authorization token using the specified request and token.
   *
   * @param {Request} req The HTTP request object which may contain token-related metadata.
   * @param {string} token The authorization token to be validated, which may follow the Bearer or Basic scheme.
   * @return {Promise<Member>} Returns a promise that resolves to a Member object if the token is valid, or null if validation fails.
   */
  private async validateToken(req: Request, token: string): Promise<Member> {
    if (token.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    } else if (token.startsWith('Basic ')) {
      return this.validateBasicAuth(token.replace('Basic ', ''));
    }

    let localJwt = true;
    let jwtTokenObject: JwtPayload = this.accessTokenService.verifyJWTToken(
      token,
    ) as TowerJWTToken;

    if (!jwtTokenObject) {
      localJwt = false;
      jwtTokenObject = this.accessTokenService.verifyOIDCToken(
        token,
      ) as TowerJWTToken;
    }

    if (jwtTokenObject) {
      const user = await this.accessTokenService.validateToken(
        jwtTokenObject.nonce,
        !localJwt,
      );

      if (user) {
        (req as any).__accessToken = user._id;
        return user.userId;
      } else {
        return null;
      }
    }
  }

  /**
   * Validates the headers of the incoming request to ensure required headers are present
   * and that the token provided is valid.
   *
   * @param {Request} req - The incoming HTTP request object containing headers to be validated.
   * @return {Object|null} The validated user object if the token is valid; otherwise, null.
   */
  private async validateTowerHeaders(req: Request) {
    try {
      let user = null;

      if (req.headers) {
        this.logger.debug(`Request headers: ${stringify(req.headers)}`);

        let neededHeaders = JSON.parse(
          process.env.TOKEN_HEADERS,
        ) as Array<string>;

        neededHeaders = ['Authorization', ...neededHeaders];

        for (const header of neededHeaders) {
          const index = req.rawHeaders.findIndex((el) => {
            return el.toLowerCase() === header.toLowerCase();
          });

          if (index >= 0 && req.rawHeaders[index + 1]) {
            user = this.validateToken(req, req.rawHeaders[index + 1] as string);
            if (user) {
              return user;
            }
          }
        }
      } else {
        this.logger.debug('No headers in the request');
      }

      return null;
    } catch (e) {
      this.logger.error(`Error validating request headers: ${e}`);
      return null;
    }
  }

  /**
   * Validates a Basic Authentication token by decoding it, extracting the username and password,
   * and attempting a login action using the extracted credentials.
   *
   * @param {string} token The Basic Authentication token to be validated, typically in the format "username:password" encoded in Base64.
   * @return {Promise<any>} A Promise that resolves with the login result if validation succeeds, or undefined in case of an error.
   */
  private async validateBasicAuth(token: string) {
    try {
      const userPass = decode(token);

      const regex = /^[^:]+/;
      const regexReplace = /^[^:]+:/;
      const username = regex.exec(userPass);
      const password = userPass.replace(regexReplace, '');

      return await this.membersService.login(
        { username: username[0], password: password },
        false,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  /**
   * Validates if the user has the roles necessary to access a resource or perform an operation.
   * Updates the request object with user roles for further processing.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Array<string>} requiredRoles - An array of roles required to access the resource or perform the operation.
   * @param {Member} user - The user object representing the current authenticated user, including their groups and details.
   * @return {Promise<boolean>} A promise that resolves to true if the user is authorized based on their roles, otherwise false.
   */
  private async validateRoles(
    req: Request,
    requiredRoles: Array<string>,
    user: Member,
  ) {
    if (user.username === 'admin') {
      (req as any).__userData.__roles = ['admin'];
      return true;
    }

    const or = [];
    for (const role of user.groups) {
      or.push({ name: role });
    }

    if (or.length === 0) {
      return false;
    }

    const groups = await this.groupsService.findWithMongoFilter({
      where: {
        $or: or,
      },
    });

    if (groups && groups.length > 0) {
      const allRoles = new Set<string>();

      groups.forEach((group) => {
        if (group.roles) {
          group.roles.forEach((role: string) => {
            allRoles.add(role);
          });
        }
      });

      (req as any).__userData.__roles = Array.from(allRoles);

      if (requiredRoles.length === 0) {
        return true;
      }

      if (allRoles.size === 0) {
        return false;
      }

      if (allRoles.has('admin')) {
        return true;
      }

      for (const requiredRole of requiredRoles) {
        if (!allRoles.has(requiredRole)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
}
