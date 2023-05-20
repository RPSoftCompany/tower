import { IsNotEmpty } from 'class-validator';

export class NewPasswordDto {
  @IsNotEmpty()
  newPassword: string;
}
