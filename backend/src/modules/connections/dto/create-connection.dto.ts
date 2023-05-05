import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateLDAPConnectionDto {
  _id?: string;

  @IsString()
  @IsNotEmpty()
  system: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  bindCredentials: string;

  @IsString()
  @IsNotEmpty()
  bindDN: string;

  @IsString()
  @IsNotEmpty()
  displayAttribute: string;

  @IsString()
  @IsNotEmpty()
  searchBase: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  usernameAttribute: string;

  @IsArray()
  defaultGroups: string[];
}

export class CreateSCPConnectionDto {
  _id?: string;
  system: string;
  enabled: boolean;
  authType: string;
  username: string;
  key?: string;
  password?: string;
  host: string;
  tokens: SCPConnectionItemDto[];
}

class SCPConnectionItemDto {
  path: string;
  template: string; //TODO switch to correct Template Ref

  [x: string]: unknown;
}

export class CreateVaultConnectionDto {
  _id: string;
  system: string;
  enabled: boolean;
  useGlobalToken: boolean;
  globalToken?: string;
  url: string;
  tokens: VaultConnectionTokenDto[];
}

class VaultConnectionTokenDto {
  name: string;
  base: string;
  token?: string;
}
