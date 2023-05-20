import { PartialType } from '@nestjs/swagger';
import { CreateV1Dto } from './create-v1.dto';

export class UpdateV1Dto extends PartialType(CreateV1Dto) {}
