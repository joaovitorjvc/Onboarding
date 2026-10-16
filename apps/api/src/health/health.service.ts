import { Injectable } from '@nestjs/common';
import type { HealthResponseDto } from './health-response.dto';

@Injectable()
export class HealthService {
  getStatus(): HealthResponseDto {
    return { status: 'ok' };
  }
}
