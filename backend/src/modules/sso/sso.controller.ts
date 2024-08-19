import {
  Controller,
  Get,
  Injectable,
  Logger,
  Post,
  Req,
  Res,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenService } from '../access-token/access-token.service';
import { JwtPayload } from 'jsonwebtoken';
import { MembersService } from '../members/members.service';
import { memberType } from '../members/dto/create-member.dto';
import { UpsertMemberDto } from '../members/dto/upsert-member.dto';
import { Request, Response } from 'express';
import process from 'process';

@ApiTags('SSO')
@Controller('sso')
@ApiBearerAuth()
@ApiBasicAuth()
@Injectable({ scope: Scope.REQUEST })
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly membersService: MembersService,
  ) {}

  @Get('login')
  ssoLogin() {
    // Handled by express-openid-connect
  }

  @Get('available')
  isSsoAvailable() {
    return !!(
      process.env.OIDC_SECRET_PRIVATE_KEY &&
      process.env.OIDC_SECRET &&
      process.env.OIDC_CALLBACK_HOST &&
      process.env.OIDC_CLIENT_ID &&
      process.env.OIDC_ISSUER_BASE_URL
    );
  }

  @Post('callback')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    const body = req.body;

    if (body?.id_token) {
      const valid = this.accessTokenService.verifyOIDCToken(body.id_token);

      if (valid) {
        const jwtToken = valid as JwtPayload;
        const name = jwtToken[process.env.OIDC_USERNAME_SOURCE_FIELD];

        const userExists = await this.membersService.find({
          where: {
            username: name,
            type: memberType.OPEN_ID,
          },
        });

        let user: UpsertMemberDto;

        if (userExists.length === 0) {
          user = await this.membersService.create({
            type: memberType.OPEN_ID,
            display: name,
            blocked: false,
            groups: [],
            newUser: false,
            username: name,
            password: '',
            technicalUser: false,
          });
        } else {
          user = userExists[0] as UpsertMemberDto;
        }

        await this.accessTokenService.createAccessTokenFromJWT(
          jwtToken,
          user._id,
        );

        res.cookie('accessToken', body.id_token);
        if (process.env.NODE_ENV === 'development') {
          res.redirect(301, `http://localhost:9000/sso/callback`);
        } else {
          res.redirect(301, `/sso/callback`);
        }
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}
