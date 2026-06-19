import express from 'express';
import { apiReference } from '@scalar/express-api-reference';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.use(
  '/',
  apiReference({
    spec: {
      content: {
        openapi: '3.1.0',
        info: {
          title: 'Bildyx API',
          version: '1.0.0',
        },
        paths: {
          '/api/health': {
            get: {
              summary: 'Health Endpoint',
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Bildyx API is running' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
