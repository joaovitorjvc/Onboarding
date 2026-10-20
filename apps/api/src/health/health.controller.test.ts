import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('retorna o estado operacional', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();
    const controller = module.get(HealthController);
    expect(controller.getHealth()).toEqual({ status: 'ok' });
    await module.close();
  });
});
