import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export interface ValidationDetail {
  field: string;
  issue: string;
}

function collectValidationDetails(error: ValidationError, parent = ''): ValidationDetail[] {
  const field = parent ? `${parent}.${error.property}` : error.property;
  const ownDetails = Object.values(error.constraints ?? {}).map((issue) => ({ field, issue }));
  const childDetails = (error.children ?? []).flatMap((child) => collectValidationDetails(child, field));
  return [...ownDetails, ...childDetails];
}

export function validationDetails(errors: ValidationError[]): ValidationDetail[] {
  return errors.flatMap((error) => collectValidationDetails(error));
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        message: 'Falha na validação dos dados.',
        details: validationDetails(errors),
      }),
  });
}
