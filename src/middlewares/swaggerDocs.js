import swaggerUI from 'swagger-ui-express';
import * as fs from 'node:fs';
import path from 'path';

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve('./docs/swagger.json'), 'utf-8'),
);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
};
