import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'nuagehub_public_route';
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(PUBLIC_ROUTE_KEY, true);
