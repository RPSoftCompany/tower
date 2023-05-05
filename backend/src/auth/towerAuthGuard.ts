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
   * canActivate
   *
   * @param context
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
   * validateToken
   *
   * @param token
   */
  private async validateToken(req: Request, token: string): Promise<Member> {
    if (token.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    } else if (token.startsWith('Basic ')) {
      return this.validateBasicAuth(token.replace('Basic ', ''));
    }

    const jwtTokenObject = this.accessTokenService.verifyJWTToken(
      token,
    ) as TowerJWTToken;

    if (jwtTokenObject) {
      const user = await this.accessTokenService.validateToken(
        jwtTokenObject.data.tokenId,
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
   * validateTowerHeaders
   * @param req
   */
  private async validateTowerHeaders(req: Request) {
    try {
      let user = null;

      if (req.headers) {
        let neededHeaders = JSON.parse(
          process.env.TOKEN_HEADERS,
        ) as Array<string>;

        neededHeaders = ['Authorization', ...neededHeaders];

        for (const header of neededHeaders) {
          const index = req.rawHeaders.findIndex((el) => {
            return el === header;
          });

          if (index >= 0 && req.rawHeaders[index + 1]) {
            user = this.validateToken(req, req.rawHeaders[index + 1] as string);
            if (user) {
              return user;
            }
          }
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * validateBasicAuth
   *
   * @param token
   * @private
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
   * validateRoles
   *
   * @param req
   * @param requiredRoles
   * @param user
   * @private
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

    if (requiredRoles.length === 0) {
      return true;
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
