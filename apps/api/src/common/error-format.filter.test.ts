import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import fc from 'fast-check';
import schema from '../../../../packages/contracts/schemas/error-format.schema.json';
import { ErrorFormatFilter } from './error-format.filter';

type MockResponse = { status: jest.Mock; json: jest.Mock; getHeader: jest.Mock };

function createHost(response: MockResponse, request = { correlationId: '550e8400-e29b-41d4-a716-446655440000' }) {
  return {
    switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
  } as never;
}

function createResponse(): MockResponse {
  const response = { status: jest.fn(), json: jest.fn(), getHeader: jest.fn(() => undefined) } as MockResponse;
  response.status.mockReturnValue(response);
  return response;
}

const ajv = new Ajv({ strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

// Feature: project-standards, Property 18: Mapeamento de exceções da API para o Formato_de_Erro
it('produz corpos válidos para validação e exceções desconhecidas', () => {
  fc.assert(
    fc.property(fc.string(), fc.string(), (message, stack) => {
      const validationResponse = createResponse();
      new ErrorFormatFilter().catch(
        new BadRequestException({
          message: 'Falha na validação dos dados.',
          details: [{ field: 'email', issue: message }],
        }),
        createHost(validationResponse),
      );
      const validationBody = validationResponse.json.mock.calls[0][0] as Record<string, unknown>;
      expect(validate(validationBody)).toBe(true);
      expect(validationBody).toMatchObject({ code: 'VALIDATION_FAILED', status: 400 });

      const internalResponse = createResponse();
      const originalMessage = `mensagem-original-${message}`;
      const originalStack = `stack-original-${stack}`;
      const exception = new Error(originalMessage);
      exception.stack = originalStack;
      new ErrorFormatFilter().catch(exception, createHost(internalResponse));
      const internalBody = internalResponse.json.mock.calls[0][0] as Record<string, unknown>;
      expect(validate(internalBody)).toBe(true);
      expect(internalBody).toMatchObject({ code: 'INTERNAL_ERROR', status: 500 });
      expect(JSON.stringify(internalBody)).not.toContain(originalMessage);
      expect(JSON.stringify(internalBody)).not.toContain(originalStack);
    }),
    { numRuns: 100 },
  );
});

describe('ErrorFormatFilter', () => {
  it('mapeia HttpException 404 para NOT_FOUND', () => {
    const response = createResponse();
    new ErrorFormatFilter().catch(new NotFoundException('Recurso ausente.'), createHost(response));
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'NOT_FOUND', status: 404 }));
  });
});
