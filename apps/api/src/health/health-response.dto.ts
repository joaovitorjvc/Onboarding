import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'], example: 'ok', description: 'Estado operacional da API.' })
  status!: 'ok';
}
